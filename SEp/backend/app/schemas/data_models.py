"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum

class IncidentType(str, Enum):
    NORMAL = "Normal"
    MEMORY_LEAK = "MemoryLeak"
    BAD_DEPLOY = "BadDeploy"
    TRAFFIC_SPIKE = "TrafficSpike"

class TelemetryData(BaseModel):
    """Single row of telemetry data"""
    mean_cpu: float = Field(..., ge=0, le=100, description="Average CPU usage %")
    std_cpu: float = Field(..., ge=0, description="CPU standard deviation")
    min_cpu: float = Field(..., ge=0, le=100)
    max_cpu: float = Field(..., ge=0, le=100)
    delta_cpu: float = Field(..., description="CPU change from previous")
    cpu_trend: float = Field(..., description="CPU trend rate")
    cpu_volatility: float = Field(..., ge=0, description="CPU volatility")
    mean_memory: float = Field(..., ge=0, le=100, description="Average memory %")
    std_memory: float = Field(..., ge=0)
    memory_trend: float = Field(..., description="Memory trend rate")
    mean_requests: float = Field(..., ge=0, description="Requests per second")
    request_spike_count: int = Field(..., ge=0, description="Number of spikes")
    throughput_delta: float = Field(..., description="Throughput change")
    cost_delta: float = Field(..., description="Cost change")
    unit_economics_ratio: float = Field(..., ge=0, description="Efficiency ratio")
    incident_type: Optional[IncidentType] = None  # Optional for prediction
    
    @validator('max_cpu')
    def max_greater_than_min(cls, v, values):
        if 'min_cpu' in values and v < values['min_cpu']:
            raise ValueError('max_cpu must be >= min_cpu')
        return v

class PredictionRequest(BaseModel):
    """Request body for single prediction"""
    data: TelemetryData

class BatchPredictionRequest(BaseModel):
    """Request body for batch predictions"""
    data: List[TelemetryData]

class PredictionResult(BaseModel):
    """Single prediction result"""
    incident_type: IncidentType
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    probabilities: dict = Field(..., description="Probability for each class")
    severity: str = Field(..., description="low/medium/high/critical")
    recommended_action: str

class BatchPredictionResponse(BaseModel):
    """Response for batch predictions"""
    predictions: List[PredictionResult]
    total_count: int
    anomaly_count: int
    summary: dict

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    version: str
