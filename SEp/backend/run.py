# backend/run.py
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DevOps Intelligence API",
    description="API for detecting and classifying system incidents",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataItem(BaseModel):
    mean_cpu: float
    std_cpu: float
    min_cpu: float
    max_cpu: float
    delta_cpu: float
    cpu_trend: float
    cpu_volatility: float
    mean_memory: float
    std_memory: float
    memory_trend: float
    mean_requests: float
    request_spike_count: float  # Accept float but will convert to int
    throughput_delta: float
    cost_delta: float
    unit_economics_ratio: float

def detect_incident_type(data: DataItem) -> Dict[str, Any]:
    """Detect incident type based on patterns with specific thresholds"""
    # Convert request_spike_count to int if it's a float
    request_spikes = int(data.request_spike_count) if hasattr(data, 'request_spike_count') else 0
    
    # Check for BadDeploy pattern first (most critical)
    bad_deploy_indicators = []
    if getattr(data, 'mean_cpu', 0) > 80:
        bad_deploy_indicators.append(f"High CPU usage ({data.mean_cpu}% > 80%)")
    if getattr(data, 'cpu_volatility', 0) > 1.0:
        bad_deploy_indicators.append(f"Elevated CPU volatility ({data.cpu_volatility:.1f} > 1.0)")
    if getattr(data, 'unit_economics_ratio', 1.0) < 1.0:
        bad_deploy_indicators.append(f"Concerning unit economics (ratio: {data.unit_economics_ratio:.1f} < 1.0)")
    if request_spikes > 5:
        bad_deploy_indicators.append(f"High request spikes detected ({request_spikes})")
    
    if len(bad_deploy_indicators) >= 2:
        return {
            "incident_type": "BadDeploy",
            "confidence": min(0.95, 0.7 + (0.1 * len(bad_deploy_indicators))),
            "indicators": bad_deploy_indicators
        }

    # Check for MemoryLeak pattern
    memory_leak_indicators = []
    if getattr(data, 'memory_trend', 0) > 0.8:
        memory_leak_indicators.append(f"Memory trend increasing ({data.memory_trend:.1f} > 0.8)")
    if getattr(data, 'mean_memory', 0) > 65:
        memory_leak_indicators.append(f"Elevated memory usage ({data.mean_memory}% > 65%)")
    if request_spikes > 0:
        memory_leak_indicators.append(f"Request spikes detected ({request_spikes})")
    
    if len(memory_leak_indicators) >= 2:
        return {
            "incident_type": "MemoryLeak",
            "confidence": min(0.9, 0.7 + (0.1 * len(memory_leak_indicators))),
            "indicators": memory_leak_indicators
        }

    # Check for TrafficSpike pattern
    traffic_spike_indicators = []
    if getattr(data, 'mean_requests', 0) > 2000:
        traffic_spike_indicators.append(f"High request count ({data.mean_requests:.0f} > 2000)")
    if getattr(data, 'throughput_delta', 0) > 200:
        traffic_spike_indicators.append(f"Elevated throughput delta ({data.throughput_delta:.0f} > 200)")
    if getattr(data, 'unit_economics_ratio', 0) > 1.2:
        traffic_spike_indicators.append(f"Healthy unit economics (ratio: {data.unit_economics_ratio:.1f} > 1.2)")
    
    if len(traffic_spike_indicators) >= 2:
        return {
            "incident_type": "TrafficSpike",
            "confidence": min(0.9, 0.7 + (0.1 * len(traffic_spike_indicators))),
            "indicators": traffic_spike_indicators + ["Legitimate traffic, not an incident"]
        }

    # Check for Normal pattern
    normal_conditions = [
        (getattr(data, 'mean_cpu', 0) < 70, f"CPU ({data.mean_cpu}%) within acceptable range (<70%)"),
        (getattr(data, 'mean_memory', 0) < 70, f"Memory ({data.mean_memory}%) within acceptable range (<70%)"),
        (getattr(data, 'unit_economics_ratio', 1.0) >= 1.0, f"Unit economics (ratio: {data.unit_economics_ratio:.1f} >= 1.0)"),
        (request_spikes <= 5, f"Acceptable request spikes ({request_spikes} <= 5)")
    ]
    
    if all(cond[0] for cond in normal_conditions):
        return {
            "incident_type": "Normal",
            "confidence": 0.9,
            "indicators": [cond[1] for cond in normal_conditions]
        }
    
    # If no specific pattern matches, but we have some concerning indicators
    concerning_indicators = []
    if getattr(data, 'mean_cpu', 0) > 70:
        concerning_indicators.append(f"Elevated CPU ({data.mean_cpu}% > 70%)")
    if getattr(data, 'mean_memory', 0) > 65:
        concerning_indicators.append(f"Elevated Memory ({data.mean_memory}% > 65%)")
    if getattr(data, 'unit_economics_ratio', 1.0) < 1.0:
        concerning_indicators.append(f"Concerning unit economics (ratio: {data.unit_economics_ratio:.1f} < 1.0)")
    if request_spikes > 5:
        concerning_indicators.append(f"Elevated request spikes ({request_spikes} > 5)")
    
    if concerning_indicators:
        return {
            "incident_type": "Watch",
            "confidence": 0.6,
            "indicators": ["Potential issues detected:"] + concerning_indicators
        }
    
    # Default to Normal with basic info
    return {
        "incident_type": "Normal",
        "confidence": 0.8,
        "indicators": [
            "No critical issues detected",
            f"CPU: {getattr(data, 'mean_cpu', 0)}%",
            f"Memory: {getattr(data, 'mean_memory', 0)}%",
            f"Request spikes: {request_spikes}",
            f"Unit economics: {getattr(data, 'unit_economics_ratio', 0):.1f}"
        ]
    }

@app.post("/api/v1/batch-predict", response_model=Dict[str, Any])
async def batch_predict(data: Dict[str, List[DataItem]]):
    """Process batch predictions for telemetry data"""
    try:
        input_data = data.get("data", [])
        if not input_data:
            raise HTTPException(status_code=400, detail="No data provided")
        
        predictions = []
        for item in input_data:
            try:
                # Get incident analysis
                incident = detect_incident_type(item)
                
                # Calculate anomaly score based on confidence and incident type
                is_anomaly = incident["incident_type"] not in ["Normal", "TrafficSpike"]
                anomaly_score = 0.3  # Base score for normal
                
                if is_anomaly:
                    # Scale score based on confidence and type severity
                    severity = {
                        "BadDeploy": 0.9,
                        "MemoryLeak": 0.8,
                        "Watch": 0.6,
                        "TrafficSpike": 0.3,
                        "Normal": 0.1
                    }.get(incident["incident_type"], 0.5)
                    
                    anomaly_score = min(0.95, 0.5 + (severity * 0.5))
                
                predictions.append({
                    "anomaly_score": round(anomaly_score, 2),
                    "is_anomaly": is_anomaly,
                    "incident_type": incident["incident_type"],
                    "confidence": round(incident["confidence"], 2),
                    "indicators": incident["indicators"],
                    "features": item.dict()
                })
                
            except Exception as e:
                logger.error(f"Error processing item: {str(e)}", exc_info=True)
                continue
        
        return {
            "predictions": predictions,
            "metadata": {
                "model_version": "2.1.0",
                "prediction_timestamp": datetime.utcnow().isoformat() + "Z",
                "input_rows": len(predictions),
                "anomalies_detected": sum(1 for p in predictions if p["is_anomaly"]),
                "status": "success"
            }
        }
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", status_code=200)
async def health_check():
    return {"status": "healthy", "version": "2.1.0"}