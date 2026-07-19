from typing import List
from datetime import datetime


def compute_analytics(readings: list) -> dict:
    if not readings:
        return {
            "temperature_avg": 0.0,
            "temperature_min": 0.0,
            "temperature_max": 0.0,
            "humidity_avg": 0.0,
            "door_open_count": 0,
            "door_open_duration": 0.0,
            "compressor_runtime": 0.0,
            "power_failure_count": 0,
            "risk_score_avg": 0.0,
            "energy_consumption": 0.0,
        }

    temperatures = [r.temperature for r in readings]
    humidities = [r.humidity for r in readings]
    door_open_seconds_list = [r.door_open_seconds for r in readings]
    compressor_on_count = sum(1 for r in readings if r.compressor_on)
    power_failures = sum(1 for r in readings if not r.power_available)
    risk_scores = [r.risk_score for r in readings]
    compressor_currents = [r.compressor_current for r in readings if r.compressor_on]

    avg_compressor_current = sum(compressor_currents) / len(compressor_currents) if compressor_currents else 0.0
    compressor_runtime_pct = compressor_on_count / len(readings) if readings else 0.0
    energy_consumption = avg_compressor_current * compressor_runtime_pct * 220 / 1000

    door_events = sum(1 for r in readings if r.door_open)
    door_total_seconds = sum(door_open_seconds_list)

    return {
        "temperature_avg": round(sum(temperatures) / len(temperatures), 2),
        "temperature_min": round(min(temperatures), 2),
        "temperature_max": round(max(temperatures), 2),
        "humidity_avg": round(sum(humidities) / len(humidities), 2),
        "door_open_count": door_events,
        "door_open_duration": round(door_total_seconds, 2),
        "compressor_runtime": round(compressor_runtime_pct * 100, 2),
        "power_failure_count": power_failures,
        "risk_score_avg": round(sum(risk_scores) / len(risk_scores), 2),
        "energy_consumption": round(energy_consumption, 4),
    }


def compute_zone_efficiency(readings_by_zone: dict) -> dict:
    results = {}
    for zone, readings in readings_by_zone.items():
        if not readings:
            results[zone] = {"efficiency_score": 0, "details": {}}
            continue

        analytics = compute_analytics(readings)

        temp_score = max(0, 100 - abs(analytics["temperature_avg"] - 4.0) * 10)
        humidity_score = max(0, 100 - abs(analytics["humidity_avg"] - 55) * 2)
        door_penalty = min(30, analytics["door_open_count"] * 5)
        power_penalty = min(20, analytics["power_failure_count"] * 10)
        risk_penalty = min(25, analytics["risk_score_avg"] / 4)

        efficiency = max(0, min(100, (temp_score + humidity_score) / 2 - door_penalty - power_penalty - risk_penalty))

        results[zone] = {
            "efficiency_score": round(efficiency, 2),
            "details": {
                "temperature_score": round(temp_score, 2),
                "humidity_score": round(humidity_score, 2),
                "door_penalty": round(door_penalty, 2),
                "power_penalty": round(power_penalty, 2),
                "risk_penalty": round(risk_penalty, 2),
            },
        }

    return results


def compute_storage_efficiency_score(readings: list) -> float:
    if not readings:
        return 0.0

    analytics = compute_analytics(readings)

    temp_compliance = sum(1 for r in readings if 0 <= r.temperature <= 8) / len(readings) * 100
    humidity_compliance = sum(1 for r in readings if 30 <= r.humidity <= 70) / len(readings) * 100
    door_compliance = max(0, 100 - analytics["door_open_count"] * 3)
    power_compliance = max(0, 100 - analytics["power_failure_count"] * 10)

    score = (temp_compliance * 0.4 + humidity_compliance * 0.3 + door_compliance * 0.15 + power_compliance * 0.15)
    return round(score, 2)
