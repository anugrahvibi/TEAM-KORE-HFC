"""
ML Model loading and inference
"""
import joblib
import numpy as np
from pathlib import Path
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

class IncidentPredictor:
    """Handles ML model inference"""
    
    # Class mapping (must match what ML engineer used)
    CLASS_NAMES = {
        0: "Normal",
        1: "MemoryLeak",
        2: "BadDeploy",
        3: "TrafficSpike"
    }
    
    SEVERITY_MAP = {
        "Normal": "low",
        "MemoryLeak": "high",
        "BadDeploy": "critical",
        "TrafficSpike": "medium"
    }
    
    ACTIONS_MAP = {
        "Normal": "Continue monitoring. System operating normally.",
        "MemoryLeak": "CRITICAL: Investigate memory leak. Check for unbounded caches, connection leaks, or circular references. Consider restarting affected services.",
        "BadDeploy": "URGENT: Rollback recent deployment immediately. Review deployment logs and run differential analysis.",
        "TrafficSpike": "Scale up resources. Monitor for DDoS. Verify legitimate traffic source. Enable auto-scaling if not already active."
    }
    
    def __init__(self, model_path: str):
        """
        Initialize predictor
        
        Args:
            model_path: Path to trained model file (.pkl or .joblib)
        """
        self.model_path = Path(model_path)
        self.model = None
        self.is_loaded = False
        
    def load_model(self):
        """Load the trained ML model"""
        try:
            self.model = joblib.load(self.model_path)
            self.is_loaded = True
            logger.info(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Could not load model: {e}")
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions
        
        Args:
            X: Feature array (n_samples, n_features)
            
        Returns:
            predictions: Array of class labels
            probabilities: Array of probabilities for each class
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Get predictions
        predictions = self.model.predict(X)
        
        # Get probabilities (if model supports it)
        if hasattr(self.model, 'predict_proba'):
            probabilities = self.model.predict_proba(X)
        else:
            # Fallback: one-hot encoding
            n_classes = len(self.CLASS_NAMES)
            probabilities = np.zeros((len(predictions), n_classes))
            probabilities[np.arange(len(predictions)), predictions] = 1.0
        
        return predictions, probabilities
    
    def format_result(self, prediction: int, probabilities: np.ndarray) -> dict:
        """
        Format single prediction result
        
        Args:
            prediction: Class label (0-3)
            probabilities: Probability array for all classes
            
        Returns:
            Formatted prediction dict
        """
        incident_type = self.CLASS_NAMES[prediction]
        confidence = float(probabilities[prediction])
        
        # Create probability dict
        prob_dict = {
            self.CLASS_NAMES[i]: float(probabilities[i])
            for i in range(len(probabilities))
        }
        
        return {
            "incident_type": incident_type,
            "confidence": confidence,
            "probabilities": prob_dict,
            "severity": self.SEVERITY_MAP[incident_type],
            "recommended_action": self.ACTIONS_MAP[incident_type]
        }
