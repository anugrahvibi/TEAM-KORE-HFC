"""
Data preprocessing utilities
"""
import pandas as pd
import numpy as np
from typing import List, Dict

class DataPreprocessor:
    """Handles data validation and preprocessing"""
    
    EXPECTED_FEATURES = [
        'mean_cpu', 'std_cpu', 'min_cpu', 'max_cpu', 'delta_cpu', 
        'cpu_trend', 'cpu_volatility', 'mean_memory', 'std_memory', 
        'memory_trend', 'mean_requests', 'request_spike_count',
        'throughput_delta', 'cost_delta', 'unit_economics_ratio'
    ]
    
    def __init__(self):
        self.feature_order = self.EXPECTED_FEATURES
    
    def validate_data(self, data: pd.DataFrame) -> bool:
        """Validate that data has all required features"""
        missing = set(self.EXPECTED_FEATURES) - set(data.columns)
        if missing:
            raise ValueError(f"Missing features: {missing}")
        return True
    
    def preprocess(self, data: pd.DataFrame) -> np.ndarray:
        """
        Preprocess data for model inference
        
        Args:
            data: DataFrame with telemetry features
            
        Returns:
            numpy array ready for model.predict()
        """
        # Ensure correct feature order
        data = data[self.feature_order].copy()
        
        # Handle missing values (if any)
        data = data.fillna(data.mean())
        
        # Convert to numpy array
        X = data.values
        
        return X
    
    def dict_to_dataframe(self, data_dict: Dict) -> pd.DataFrame:
        """Convert dict to DataFrame (single row)"""
        return pd.DataFrame([data_dict])
    
    def list_to_dataframe(self, data_list: List[Dict]) -> pd.DataFrame:
        """Convert list of dicts to DataFrame"""
        return pd.DataFrame(data_list)
