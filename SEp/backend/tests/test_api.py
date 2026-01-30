"""
Test script for API endpoints
"""
import requests
import json
import os
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    """Test health check endpoint"""
    print("\nTesting health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Health check passed")

def test_single_prediction():
    """Test single prediction endpoint"""
    print("\nTesting single prediction...")
    data = {
        "data": {
            "mean_cpu": 52.0,
            "std_cpu": 4.0,
            "min_cpu": 45.0,
            "max_cpu": 60.0,
            "delta_cpu": 3.0,
            "cpu_trend": 0.2,
            "cpu_volatility": 0.15,
            "mean_memory": 48.0,
            "std_memory": 3.0,
            "memory_trend": 0.1,
            "mean_requests": 1200.0,
            "request_spike_count": 0,
            "throughput_delta": 50.0,
            "cost_delta": 5.0,
            "unit_economics_ratio": 1.4
        }
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=data)
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    print("✓ Single prediction test passed")

def test_batch_prediction():
    """Test batch prediction endpoint"""
    print("\nTesting batch prediction...")
    data = {
        "data": [
            {
                "mean_cpu": 52.0,
                "std_cpu": 4.0,
                "min_cpu": 45.0,
                "max_cpu": 60.0,
                "delta_cpu": 3.0,
                "cpu_trend": 0.2,
                "cpu_volatility": 0.15,
                "mean_memory": 48.0,
                "std_memory": 3.0,
                "memory_trend": 0.1,
                "mean_requests": 1200.0,
                "request_spike_count": 0,
                "throughput_delta": 50.0,
                "cost_delta": 5.0,
                "unit_economics_ratio": 1.4
            },
            {
                "mean_cpu": 90.0,
                "std_cpu": 15.0,
                "min_cpu": 55.0,
                "max_cpu": 99.0,
                "delta_cpu": 35.0,
                "cpu_trend": 2.5,
                "cpu_volatility": 1.8,
                "mean_memory": 60.0,
                "std_memory": 5.0,
                "memory_trend": 0.3,
                "mean_requests": 1600.0,
                "request_spike_count": 3,
                "throughput_delta": 120.0,
                "cost_delta": 35.0,
                "unit_economics_ratio": 0.5
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/batch-predict", json=data)
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    print("✓ Batch prediction test passed")

def test_model_info():
    """Test model info endpoint"""
    print("\nTesting model info...")
    response = requests.get(f"{BASE_URL}/model-info")
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))
    assert response.status_code == 200
    print("✓ Model info test passed")

if __name__ == "__main__":
    print("Starting API tests...")
    
    # Run tests
    test_health()
    test_single_prediction()
    test_batch_prediction()
    test_model_info()
    
    print("\n✓ All tests completed successfully!")
