"""
API endpoint definitions
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import pandas as pd
import io
import logging

from app.schemas.data_models import (
    PredictionRequest,
    BatchPredictionRequest,
    PredictionResult,
    BatchPredictionResponse,
    HealthResponse
)
from app.models.ml_model import IncidentPredictor
from app.utils.preprocessor import DataPreprocessor

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize ML model and preprocessor (will be loaded on startup)
predictor = IncidentPredictor(model_path="app/models/trained_model.pkl")
preprocessor = DataPreprocessor()

@router.post("/predict", response_model=PredictionResult)
async def predict_single(request: PredictionRequest):
    """
    Predict incident type for a single telemetry data point
    
    Example request:
    POST /predict
    {
        "data": {
            "mean_cpu": 52,
            "std_cpu": 4,
            "min_cpu": 45,
            "max_cpu": 60,
            ... (all 15 features)
        }
    }
    """
    try:
        # Convert request to dict (exclude incident_type if present)
        data_dict = request.data.dict(exclude={'incident_type'})
        
        # Convert to DataFrame
        df = preprocessor.dict_to_dataframe(data_dict)
        
        # Preprocess
        X = preprocessor.preprocess(df)
        
        # Predict
        predictions, probabilities = predictor.predict(X)
        
        # Format result
        result = predictor.format_result(predictions[0], probabilities[0])
        
        return PredictionResult(**result)
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/batch-predict", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    """
    Predict incident types for multiple telemetry data points
    
    Example request:
    POST /batch-predict
    {
        "data": [
            {"mean_cpu": 52, "std_cpu": 4, ...},
            {"mean_cpu": 90, "std_cpu": 15, ...},
            ...
        ]
    }
    """
    try:
        # Convert request to list of dicts
        data_list = [item.dict(exclude={'incident_type'}) for item in request.data]
        
        # Convert to DataFrame
        df = preprocessor.list_to_dataframe(data_list)
        
        # Preprocess
        X = preprocessor.preprocess(df)
        
        # Predict
        predictions, probabilities = predictor.predict(X)
        
        # Format results
        results = []
        anomaly_count = 0
        severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        
        for pred, probs in zip(predictions, probabilities):
            result = predictor.format_result(pred, probs)
            results.append(PredictionResult(**result))
            
            # Count anomalies (non-normal)
            if result["incident_type"] != "Normal":
                anomaly_count += 1
            
            # Count severities
            severity_counts[result["severity"]] += 1
        
        # Create summary
        summary = {
            "total_samples": len(results),
            "anomaly_rate": anomaly_count / len(results) if results else 0,
            "severity_distribution": severity_counts,
            "most_common_incident": max(
                set([r.incident_type for r in results]),
                key=[r.incident_type for r in results].count
            ) if results else "None"
        }
        
        return BatchPredictionResponse(
            predictions=results,
            total_count=len(results),
            anomaly_count=anomaly_count,
            summary=summary
        )
    
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@router.post("/predict-csv")
async def predict_from_csv(file: UploadFile = File(...)):
    """
    Upload CSV file and get predictions
    
    Example:
    POST /predict-csv
    Content-Type: multipart/form-data
    file: telemetry_data.csv
    """
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Remove incident_type column if present (we're predicting it)
        if 'incident_type' in df.columns:
            df = df.drop('incident_type', axis=1)
        
        # Validate
        preprocessor.validate_data(df)
        
        # Preprocess
        X = preprocessor.preprocess(df)
        
        # Predict
        predictions, probabilities = predictor.predict(X)
        
        # Format results
        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            result = predictor.format_result(pred, probs)
            result['row_index'] = i  # Add row number for reference
            results.append(result)
        
        return {
            "status": "success",
            "file_name": file.filename,
            "rows_processed": len(results),
            "predictions": results
        }
    
    except Exception as e:
        logger.error(f"CSV prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"CSV prediction failed: {str(e)}")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    """
    return HealthResponse(
        status="healthy" if predictor.is_loaded else "unhealthy",
        model_loaded=predictor.is_loaded,
        version="1.0.0"
    )

@router.get("/model-info")
async def model_info():
    """
    Get information about the loaded model
    """
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "model_type": str(type(predictor.model).__name__),
        "classes": predictor.CLASS_NAMES,
        "feature_count": len(preprocessor.EXPECTED_FEATURES),
        "features": preprocessor.EXPECTED_FEATURES
    }
