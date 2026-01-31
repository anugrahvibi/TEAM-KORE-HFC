import requests
import time
from datetime import datetime, timedelta

service = "payment-service"
metric_name = "service_cpu_usage_percent"
window = 300

end_time = datetime.utcnow()
start_time = end_time - timedelta(seconds=window)

print(f"Time Range (UTC): {start_time} to {end_time}")
print(f"Timestamp: {start_time.timestamp()} to {end_time.timestamp()}")

try:
    url = 'http://localhost:9090/api/v1/query_range'
    params = {
        'query': f'{metric_name}{{service="{service}"}}',
        'start': start_time.timestamp(),
        'end': end_time.timestamp(),
        'step': '5s'
    }
    print(f"Requesting: {url} with params {params}")
    response = requests.get(url, params=params, timeout=2)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
