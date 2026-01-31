from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from database import db
from correlation_engine import correlate_change_to_impact
import requests
import os

app = FastAPI(title="DevInsight Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for hackathon/dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetricPayload(BaseModel):
    service: str
    timestamp: Optional[str] = None
    cpu_percent: float
    memory_mb: float
    network_out_mbps: float
    request_count: int
    error_count: int
    latency_p95_ms: float

class ChangeEvent(BaseModel):
    change_id: str
    service: str
    timestamp: Optional[str] = None
    description: str
    version: str

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/ingest/metrics")
def ingest_metrics(payload: MetricPayload):
    data = payload.dict()
    if not data.get('timestamp'):
        data['timestamp'] = datetime.utcnow()
    else:
        # Parse timestamp string to datetime object if needed
        try:
            data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        except:
             pass 
    
    # Store in MongoDB
    db.metrics.insert_one(data)
    
    return {"status": "success"}

@app.post("/ingest/change")
async def ingest_change(event: ChangeEvent, background_tasks: BackgroundTasks):
    data = event.dict()
    if not data.get('timestamp'):
        data['timestamp'] = datetime.utcnow()
    else:
        try:
            data['timestamp'] = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        except:
            pass

    # Store change event
    db.changes.insert_one(data)
    
    # Trigger correlation analysis (async)
    # We wait a bit or schedule it? For simplicity, we can trigger it immediately 
    # but the analysis needs "after" data. 
    # Realistically, we'd schedule this 5 mins later.
    # For Hackathon demo: The simulation might send historical data or fast-forward.
    # We will assume we can check immediately or client triggers check.
    # Let's just return success for now. User might verify via another endpoint or logs.
    
    return {"status": "success", "change_id": data.get('change_id')}

@app.get("/metrics/recent")
def get_recent_metrics(service: str, window: int = 300):
    # Query Prometheus
    # We want: cpu, memory, latency, traffic
    # PromQL: service_cpu_usage_percent{service="<service>"}
    
    end_time = datetime.now()
    start_time = end_time - timedelta(seconds=window)
    
    # Helper to query range
    def query_prom(metric_name):
        try:
            response = requests.get(
                'http://localhost:9090/api/v1/query_range',
                params={
                    'query': f'{metric_name}{{service="{service}"}}',
                    'start': start_time.timestamp(),
                    'end': end_time.timestamp(),
                    'step': '5s'
                },
                timeout=2
            )
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success' and data['data']['result']:
                    return data['data']['result'][0]['values']
            return []
        except Exception as e:
            print(f"Prometheus Query Error: {e}")
            return []

    # Fetch all metrics
    # Note: efficient way implies async or parallel, but for demo sync is fine
    cpu_values = query_prom('service_cpu_usage_percent')
    latency_values = query_prom('service_latency_ms')
    traffic_values = query_prom('service_request_rate_ops')
    
    # Align data (Prometheus returns [timestamp, value])
    # We will pivot on Cpu values as base
    results = []
    
    # Create valid map for O(1) lookup? Or just zip if lengths match? 
    # They might slightly differ.
    
    # Let's just map based on CPU timestamps
    lat_map = {row[0]: row[1] for row in latency_values}
    traf_map = {row[0]: row[1] for row in traffic_values}
    
    for row in cpu_values:
        ts = row[0]
        val = row[1]
        
        # Construct classic object format for Frontend
        obj = {
            # Prom returns float timestamp, we need ISO for frontend
            "timestamp": datetime.fromtimestamp(ts).isoformat(),
            "cpu_percent": float(val),
            "latency_p95_ms": float(lat_map.get(ts, 0)),
            "request_count": float(traf_map.get(ts, 0)), 
             # Mock values for missing ones since we didn't export everything or just zero
            "memory_mb": 0,
            "network_out_mbps": 0,
            "error_count": 0
        }
        results.append(obj)

    return {"metrics": results}

@app.get("/analysis/correlate/{change_id}")
def analyze_change(change_id: str):
    """Manually trigger correlation analysis for a change"""
    result = correlate_change_to_impact(change_id)
    # cleanup mongo id if present in alert
    if result.get('_id'):
        result['_id'] = str(result['_id'])
    if result.get('timestamp') and isinstance(result['timestamp'], datetime):
        result['timestamp'] = result['timestamp'].isoformat()
        
    return result

@app.get("/alerts")
def get_alerts(limit: int = 20):
    """Get recent alerts"""
    alerts = db.alerts.find().sort('timestamp', -1).limit(limit)
    results = []
    for a in alerts:
        a['_id'] = str(a['_id'])
        if isinstance(a.get('timestamp'), datetime):
            a['timestamp'] = a['timestamp'].isoformat()
        results.append(a)
    return {"alerts": results}

@app.get("/changes")
def get_changes(limit: int = 10):
    """Get recent deployment changes"""
    changes = db.changes.find().sort('timestamp', -1).limit(limit)
    results = []
    for c in changes:
        c['_id'] = str(c['_id'])
        if isinstance(c.get('timestamp'), datetime):
             c['timestamp'] = c['timestamp'].isoformat()
        results.append(c)
    return {"changes": results}

# Endpoint to test integration with ML Service (Proxy)
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml-service:8001")

@app.post("/predict/anomaly")
def proxy_predict_anomaly(cpu_values: List[float]):
    try:
        response = requests.post(f"{ML_SERVICE_URL}/predict/anomaly", json=cpu_values, timeout=5)
        return response.json()
    except Exception as e:
        # Mock response if ML service is down (for testing/demo)
        return {
            "status": "mocked_response", 
            "anomaly_detected": True if max(cpu_values) > 80 else False,
            "confidence": 0.95,
            "root_cause": "cpu_spike"
        }

@app.post("/predict/impact")
def predict_blast_radius(change_details: dict):
    """
    Proxy request to ML service for Blast Radius Prediction (Innovation Feature)
    """
    try:
        response = requests.post(f"{ML_SERVICE_URL}/predict/blast_radius", json=change_details, timeout=5)
        return response.json()
    except Exception as e:
        # Return a mocked "High Risk" response for the hackathon demo if ML service is down
        return {
             "blast_radius": ["payment-service", "checkout-service", "api-gateway"],
             "risk_score": 85,
             "cost_impact": {
                 "compute": 800,
                 "memory": 125,
                 "egress": 322,
                 "total": 1247
             },
             "rollback_probability": 0.72,
             "warnings": ["Egress cost increase detected"],
             "status": "mocked_prediction"
        }

from datetime import timedelta
