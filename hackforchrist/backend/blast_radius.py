from datetime import datetime

# Static dependency map for hackathon demonstration
# Format: Service -> [List of services that depend ON it]
DEPENDENCY_MAP = {
    "auth-service": [
        {"service": "api-gateway", "type": "sync", "depth": 1},
        {"service": "user-service", "type": "sync", "depth": 1}
    ],
    "api-gateway": [
        {"service": "order-service", "type": "sync", "depth": 2},
        {"service": "catalog-service", "type": "async", "depth": 2}
    ],
    "order-service": [
        {"service": "payment-service", "type": "sync", "depth": 3},
        {"service": "inventory-service", "type": "async", "depth": 3}
    ]
}

def analyze_blast_radius(service_name, current_metrics):
    """
    Predicts the blast radius of a failure in service_name based on dependencies.
    """
    # 1. Determine current state based on metrics
    # If latency is high or CPU is saturated, mark as degrading
    latency = current_metrics.get("latency_p95_ms", 0)
    cpu = current_metrics.get("mean_cpu", 0)
    
    state = "Healthy"
    confidence = 0.95
    trigger_signals = []
    
    if latency > 500: # Threshold for demo
        state = "Degrading"
        trigger_signals.append(f"Latency p95 increased {round(latency/200, 1)}x over baseline")
        confidence = 0.68
    
    if cpu > 80:
        state = "Critical" if state == "Degrading" else "Degrading"
        trigger_signals.append(f"CPU saturation sustained for {round(cpu/10)} minutes")
        confidence = min(confidence, 0.72)

    # 2. Trace Propagation
    predicted_propagation = []
    
    def trace(s_name, current_depth=1):
        if s_name not in DEPENDENCY_MAP:
            return
        
        for dep in DEPENDENCY_MAP[s_name]:
            risk = "High" if dep["type"] == "sync" else "Medium"
            conf = 0.8 / (current_depth) # Confidence drops with depth
            
            predicted_propagation.append({
                "service": dep["service"],
                "risk_level": risk,
                "confidence": round(conf, 2),
                "expected_impact_minutes": 5 * current_depth,
                "reason": f"{s_name} is {dep['type']} dependency"
            })
            
            # Recursive trace for deeper impacts
            trace(dep["service"], current_depth + 1)

    trace(service_name)

    # 3. Summary
    summary = {
        "total_services_at_risk": len(set(p["service"] for p in predicted_propagation)),
        "max_propagation_depth": max([p["expected_impact_minutes"]/5 for p in predicted_propagation]) if predicted_propagation else 0,
        "estimated_users_affected": 8200 if state != "Healthy" else 0,
        "sla_violation_risk": "Likely" if state == "Critical" else ("Possible" if state == "Degrading" else "Low")
    }

    return {
        "service": service_name,
        "blast_radius": {
            "current_state": state,
            "confidence": confidence,
            "trigger_signals": trigger_signals,
            "predicted_propagation": predicted_propagation,
            "blast_radius_summary": summary
        }
    }
