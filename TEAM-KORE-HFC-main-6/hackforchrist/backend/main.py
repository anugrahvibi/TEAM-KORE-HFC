from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr
from database import db
from correlation_engine import calculate_correlation
from blast_radius import analyze_blast_radius
import requests
import os
import joblib
import numpy as np
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import hashlib
import secrets

app = FastAPI(title="Sentinal Backend")

# Load ML Models
ML_DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
ML_INPUT_DIR = os.path.join(ML_DATA_DIR, "input")
ML_OUTPUT_DIR = os.path.join(ML_DATA_DIR, "output")
ML_RESULTS_FILE = os.path.join(ML_OUTPUT_DIR, "ml_results.json")
BLAST_RADIUS_FILE = os.path.join(ML_OUTPUT_DIR, "blast_radius_results.json")

# Ensure directories exist
os.makedirs(ML_INPUT_DIR, exist_ok=True)
os.makedirs(ML_OUTPUT_DIR, exist_ok=True)

# Load ML Models
try:
    # Models are in the root of 'cat'
    ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
    iso_forest = joblib.load(os.path.join(ROOT_DIR, "isolation_forest_model.pkl"))
    rand_forest = joblib.load(os.path.join(ROOT_DIR, "random_forest_model.pkl"))
    print("✅ ML Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading ML models: {e}")
    iso_forest = None
    rand_forest = None

    rand_forest = None

# Global state for Baseline tracking (Hackathon simplified)
BASELINE_FEATURES = None
MOCK_CHANGE_EVENT = {
    "type": "deployment",
    "service": "payment-api",
    "timestamp": datetime.now().isoformat()
}

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

# Authentication Models
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    token: str
    email: EmailStr
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar: str
    created_at: datetime

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
    memory_values = query_prom('service_memory_usage_mb')
    
    # Align data (Prometheus returns [timestamp, value])
    # We will pivot on Cpu values as base
    results = []
    
    # Create valid map for O(1) lookup? Or just zip if lengths match? 
    # They might slightly differ.
    
    # Let's just map based on CPU timestamps
    lat_map = {row[0]: row[1] for row in latency_values}
    traf_map = {row[0]: row[1] for row in traffic_values}
    mem_map = {row[0]: row[1] for row in memory_values}
    
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
            "memory_mb": float(mem_map.get(ts, 0)),
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

# ML Feature Extraction and Scanning Logic
FEATURE_NAMES = [
    'mean_cpu', 'std_cpu', 'min_cpu', 'max_cpu', 'delta_cpu', 'cpu_trend',
    'cpu_volatility', 'mean_memory', 'std_memory', 'memory_trend',
    'mean_requests', 'request_spike_count', 'throughput_delta', 'cost_delta',
    'unit_economics_ratio'
]

def extract_features(metrics_list: List[Dict]):
    """Calculate 15 features expected by the models from a list of metrics objects."""
    if not metrics_list:
        return None
    
    cpus = [m['cpu_percent'] for m in metrics_list]
    mems = [m['memory_mb'] for m in metrics_list]
    reqs = [m['request_count'] for m in metrics_list]
    
    # Dummy cost calculation: CPU influence + Memory influence
    costs = [c * 0.05 + m * 0.01 for c, m in zip(cpus, mems)]
    
    # Basic Stats
    mean_cpu = np.mean(cpus)
    std_cpu = np.std(cpus)
    min_cpu = np.min(cpus)
    max_cpu = np.max(cpus)
    delta_cpu = cpus[-1] - cpus[0]
    
    # Trend: Simple slope
    x = np.arange(len(cpus))
    cpu_trend = np.polyfit(x, cpus, 1)[0] if len(cpus) > 1 else 0
    cpu_volatility = std_cpu
    
    mean_memory = np.mean(mems)
    std_memory = np.std(mems)
    memory_trend = np.polyfit(x, mems, 1)[0] if len(mems) > 1 else 0
    
    mean_requests = np.mean(reqs)
    # Spike: requests > 1.5 * mean
    request_spike_count = sum(1 for r in reqs if r > mean_requests * 1.5)
    throughput_delta = reqs[-1] - reqs[0]
    
    cost_delta = costs[-1] - costs[0]
    # Unit econ: requests per dollar
    unit_economics_ratio = sum(reqs) / sum(costs) if sum(costs) > 0 else 0
    
    features = [
        mean_cpu, std_cpu, min_cpu, max_cpu, delta_cpu, cpu_trend,
        cpu_volatility, mean_memory, std_memory, memory_trend,
        mean_requests, request_spike_count, throughput_delta, cost_delta,
        unit_economics_ratio
    ]
    
    return np.array(features).reshape(1, -1)

@app.get("/debug/metrics")
def debug_metrics():
    """Debug endpoint to see what's in the database"""
    try:
        # Get all metrics without time filter first
        all_metrics = list(db.metrics.find({}))
        
        # Then try with time filter
        from datetime import datetime, timedelta
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=1)
        
        metrics_cursor = db.metrics.find({
            "service": "payment-service",
            "timestamp": {"$gte": start_time, "$lte": end_time}
        }).sort("timestamp", -1).limit(10)
        
        metrics = list(metrics_cursor)
        
        return {
            "all_count": len(all_metrics),
            "all_data": all_metrics[:5],  # First 5
            "filtered_count": len(metrics),
            "filtered_data": metrics,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

# Authentication Endpoints
def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_avatar(email: str) -> str:
    """Generate avatar URL based on email"""
    return f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"

@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "password": hashed_password,
            "avatar": generate_avatar(user_data.email),
            "created_at": datetime.utcnow(),
            "auth_provider": "email"
        }
        
        # Insert user
        result = db.users.insert_one(user_doc)
        
        return UserResponse(
            id=str(result.inserted_id),
            email=user_data.email,
            full_name=user_data.full_name,
            avatar=user_doc["avatar"],
            created_at=user_doc["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    """Login user with email and password"""
    try:
        # Find user
        user = db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        hashed_password = hash_password(login_data.password)
        if user["password"] != hashed_password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            avatar=user["avatar"],
            created_at=user["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/auth/google", response_model=UserResponse)
async def google_auth(google_data: GoogleAuth):
    """Authenticate with Google OAuth"""
    try:
        # In a real implementation, you would verify the Google token here
        # For demo purposes, we'll accept any token and create/update user
        
        # Find or create user
        user = db.users.find_one({"email": google_data.email})
        
        if not user:
            # Create new user
            user_doc = {
                "email": google_data.email,
                "full_name": google_data.full_name or google_data.email.split("@")[0],
                "password": "",  # No password for OAuth users
                "avatar": generate_avatar(google_data.email),
                "created_at": datetime.utcnow(),
                "auth_provider": "google"
            }
            result = db.users.insert_one(user_doc)
            user_id = str(result.inserted_id)
        else:
            # Update existing user
            user_id = str(user["_id"])
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Get updated user data
        user = db.users.find_one({"email": google_data.email})
        
        return UserResponse(
            id=user_id,
            email=user["email"],
            full_name=user["full_name"],
            avatar=user["avatar"],
            created_at=user["created_at"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google auth failed: {str(e)}")

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(email: str):
    """Get current user profile"""
    try:
        user = db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            avatar=user["avatar"],
            created_at=user["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@app.get("/ml/scan")
async def scan_now(service: str = "payment-service"):
    """Trigger a manual ML scan, run correlation, and save unified payload."""
    global BASELINE_FEATURES
    
    if not iso_forest or not rand_forest:
        return {"error": "Models not loaded"}
    
    # 1. Get metrics from MongoDB (last 50 records for ML scan)
    from datetime import datetime, timedelta
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=24)  # Get last 24 hours of data
    
    metrics_cursor = db.metrics.find({
        "service": service,
        "timestamp": {"$gte": start_time, "$lte": end_time}
    }).sort("timestamp", -1).limit(50)
    
    metrics = list(metrics_cursor)
    
    if len(metrics) < 5:
        return {"error": f"Insufficient data for ML scan (found {len(metrics)} points, need at least 5)"}
    
    # 2. Extract Features - convert MongoDB docs to feature format
    feature_data = []
    for metric in metrics:
        feature_data.append({
            'cpu_percent': metric.get('cpu_percent', 0),
            'memory_mb': metric.get('memory_mb', 0),
            'network_out_mbps': metric.get('network_out_mbps', 0),
            'request_count': metric.get('request_count', 0),
            'error_count': metric.get('error_count', 0),
            'latency_p95_ms': metric.get('latency_p95_ms', 0)
        })
    
    X = extract_features(feature_data)
    current_features = {name: float(val) for name, val in zip(FEATURE_NAMES, X[0])}
    
    # 3. Predict
    iso_pred = iso_forest.predict(X)[0]
    iso_score = iso_forest.decision_function(X)[0]
    
    rf_pred = str(rand_forest.predict(X)[0])
    rf_probs = rand_forest.predict_proba(X)[0].tolist()
    
    # 4. Correlation Analysis
    # If no baseline yet, use current as baseline for next round
    if BASELINE_FEATURES is None:
        BASELINE_FEATURES = current_features
        # Mock a slightly lower baseline for FIRST run demo if needed, 
        # or just wait for next scan. Let's make it a bit dynamic for the WOW factor.
        BASELINE_FEATURES = {k: v * 0.7 for k, v in current_features.items()}

    correlation_results = calculate_correlation(BASELINE_FEATURES, current_features, MOCK_CHANGE_EVENT)
    
    # Update baseline for next time
    BASELINE_FEATURES = current_features
    
    # 5. Build Unified Payload (EXACT SCHEMA REQUESTED)
    final_payload = {
        "service": service,

        "change_event": {
            "type": MOCK_CHANGE_EVENT["type"],
            "timestamp": MOCK_CHANGE_EVENT["timestamp"]
        },

        "anomaly": {
            "score": round(float(iso_score), 3),
            "is_anomaly": bool(iso_pred == -1)
        },

        "correlation": {
            "is_correlated": correlation_results["is_correlated"],
            "confidence": correlation_results["confidence"],
            "delay_minutes": correlation_results["delay_minutes"]
        },

        "indicators": correlation_results["indicators"]
    }
    
    # Save to file
    with open(ML_RESULTS_FILE, "w") as f:
        json.dump(final_payload, f, indent=4)
        
    return final_payload

@app.get("/ml/results")
def get_ml_results():
    """Get the latest saved ML scan results."""
    if not os.path.exists(ML_RESULTS_FILE):
        return {"error": "No scan results found yet. Run /ml/scan first."}
    
    with open(ML_RESULTS_FILE, "r") as f:
        return json.load(f)

@app.get("/ml/blast-radius")
async def get_blast_radius(service: str = "auth-service"):
    """
    Predict the blast radius of a failure in the specified service.
    """
    # 1. Get recent metrics to determine current health
    # Using existing get_recent_metrics helper
    resp = get_recent_metrics(service, window=300)
    metrics_list = resp.get("metrics", [])
    
    current_metrics = {}
    if not metrics_list:
        # For demo purposes, if no live metrics, use mock values to trigger analysis
        current_metrics = {
            "latency_p95_ms": 650,
            "mean_cpu": 85,
            "mean_requests": 1200
        }
    else:
        # Aggregate last 5 mins
        current_metrics = {
            "latency_p95_ms": float(np.mean([m["latency_p95_ms"] for m in metrics_list])),
            "mean_cpu": float(np.mean([m["cpu_percent"] for m in metrics_list])),
            "mean_requests": float(np.mean([m["request_count"] for m in metrics_list]))
        }

    # 2. Run analysis
    analysis_results = analyze_blast_radius(service, current_metrics)
    
    # 3. Save to file in requested format
    with open(BLAST_RADIUS_FILE, "w") as f:
        json.dump(analysis_results, f, indent=4)
        
    return analysis_results

@app.get("/health")
def health_check():
    return {"status": "healthy"}
