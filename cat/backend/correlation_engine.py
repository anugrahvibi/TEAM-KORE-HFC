from scipy.stats import ttest_ind
import numpy as np
from datetime import datetime, timedelta
from database import db

def get_metrics_in_range(service, start_time, end_time):
    """Retrieve metrics for a service within a time range."""
    # Ensure times are datetime objects
    cursor = db.metrics.find({
        'service': service,
        'timestamp': {'$gte': start_time, '$lte': end_time}
    })
    
    metrics = list(cursor)
    # Extract latency values for analysis. You might want to analyze other metrics too.
    latencies = [m.get('latency_p95_ms', 0) for m in metrics]
    return latencies

def correlate_change_to_impact(change_id):
    """
    Determine if a change caused performance degradation
    Uses statistical significance testing
    """
    # Get change event
    change = db.changes.find_one({'change_id': change_id})
    if not change:
        return {"error": "Change not found"}
        
    timestamp = change.get('timestamp')
    if isinstance(timestamp, str):
        try:
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except ValueError:
             # handle cases without Z or different format if needed
             pass

    service = change.get('service')
    
    # Get metrics before (5 min) and after (5 min)
    window_seconds = 300
    before_latencies = get_metrics_in_range(service, timestamp - timedelta(seconds=window_seconds), timestamp)
    after_latencies = get_metrics_in_range(service, timestamp, timestamp + timedelta(seconds=window_seconds))
    
    if len(before_latencies) < 3 or len(after_latencies) < 3:
        return {
            "type": "INSUFFICIENT_DATA",
             "message": "Not enough data points to perform correlation"
        }

    # Statistical test (t-test)
    # Null hypothesis: the means are equal.
    # If p-value < 0.05, we reject null hypothesis -> significant difference.
    stat, p_value = ttest_ind(before_latencies, after_latencies, equal_var=False)
    
    # Check direction of change
    mean_before = np.mean(before_latencies)
    mean_after = np.mean(after_latencies)
    
    if p_value < 0.05:  # Significant change
        # Calculate impact
        latency_delta = mean_after - mean_before
        latency_delta_pct = (latency_delta / mean_before) * 100 if mean_before != 0 else 100.0
        
        # If latency increased, it's a degradation
        severity = "HIGH" if latency_delta_pct > 20 else "MEDIUM"
        if latency_delta_pct < 0:
             severity = "IMPROVED" # Logic can be expanded

        # Generate alert
        alert = {
            "type": "CHANGE_IMPACT_DETECTED",
            "change_id": change_id,
            "service": service,
            "impact": {
                "latency_before": mean_before,
                "latency_after": mean_after,
                "latency_delta_percent": latency_delta_pct,
                "causal_confidence": 1 - p_value
            },
            "severity": severity,
            "timestamp": datetime.utcnow()
        }
        
        db.alerts.insert_one(alert)
        return alert
    else:
        # NEGATIVE CORRELATION (important!)
        return {
            "type": "CHANGE_NO_IMPACT",
            "message": "Deployment verified safe",
            "confidence": 1 - p_value
        }
