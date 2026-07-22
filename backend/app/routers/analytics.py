from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import statistics

from ..database import get_db
from ..models import TelemetryReading, Device, DeviceStatus
from ..schemas import AnalyticsResponse

router = APIRouter()


def _time_series(db: Session, device_id: Optional[int], hours: int, metric: str):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)
    readings = query.order_by(TelemetryReading.created_at.asc()).all()

    labels = []
    values = []
    for r in readings:
        labels.append(r.created_at.strftime("%Y-%m-%d %H:%M"))
        val = getattr(r, metric, None)
        values.append(round(val, 2) if val is not None else None)

    return labels, values


@router.get("/temperature")
def temperature_analytics(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    labels, temps = _time_series(db, device_id, hours, "temperature")
    valid = [t for t in temps if t is not None]
    return {
        "labels": labels,
        "values": temps,
        "summary": {
            "avg": round(statistics.mean(valid), 2) if valid else 0,
            "min": round(min(valid), 2) if valid else 0,
            "max": round(max(valid), 2) if valid else 0,
            "std_dev": round(statistics.stdev(valid), 2) if len(valid) > 1 else 0,
            "trend": "stable",
            "total_readings": len(valid),
        }
    }


@router.get("/machine-health")
def machine_health_analytics(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    labels, scores = _time_series(db, device_id, hours, "machine_health_score")
    valid = [s for s in scores if s is not None]
    avg_score = round(statistics.mean(valid), 2) if valid else 0
    if avg_score >= 80:
        status = "excellent"
    elif avg_score >= 60:
        status = "good"
    elif avg_score >= 40:
        status = "warning"
    else:
        status = "critical"
    return {
        "labels": labels,
        "values": scores,
        "summary": {
            "avg_score": avg_score,
            "status": status,
            "min": round(min(valid), 2) if valid else 0,
            "max": round(max(valid), 2) if valid else 0,
            "total_readings": len(valid),
        }
    }


@router.get("/water-quality")
def water_quality_analytics(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)
    readings = query.order_by(TelemetryReading.created_at.asc()).all()

    labels, ph_vals, turb_vals, tds_vals, scores = [], [], [], [], []
    for r in readings:
        labels.append(r.created_at.strftime("%Y-%m-%d %H:%M"))
        ph_vals.append(round(r.water_ph, 2) if r.water_ph else None)
        turb_vals.append(round(r.water_turbidity, 2) if r.water_turbidity else None)
        tds_vals.append(round(r.water_tds, 2) if r.water_tds else None)
        scores.append(round(r.water_quality_score, 2) if r.water_quality_score else None)

    valid_ph = [v for v in ph_vals if v is not None]
    valid_scores = [s for s in scores if s is not None]
    return {
        "labels": labels,
        "ph": ph_vals,
        "turbidity": turb_vals,
        "tds": tds_vals,
        "scores": scores,
        "summary": {
            "avg_ph": round(statistics.mean(valid_ph), 2) if valid_ph else 0,
            "avg_score": round(statistics.mean(valid_scores), 2) if valid_scores else 0,
            "total_readings": len(valid_ph),
        }
    }


@router.get("/warehouse")
def warehouse_analytics(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    labels, temps = _time_series(db, device_id, hours, "temperature")
    _, humidities = _time_series(db, device_id, hours, "humidity")
    _, risks = _time_series(db, device_id, hours, "risk_score")
    valid_temps = [t for t in temps if t is not None]
    valid_humid = [h for h in humidities if h is not None]
    valid_risks = [r for r in risks if r is not None]
    return {
        "labels": labels,
        "temperature": temps,
        "humidity": humidities,
        "risk_score": risks,
        "summary": {
            "avg_temp": round(statistics.mean(valid_temps), 2) if valid_temps else 0,
            "avg_humidity": round(statistics.mean(valid_humid), 2) if valid_humid else 0,
            "avg_risk": round(statistics.mean(valid_risks), 2) if valid_risks else 0,
            "total_readings": len(valid_temps),
        }
    }


@router.get("/predictive")
def predictive_analytics(
    device_id: Optional[int] = None,
    hours: int = Query(72, ge=24, le=720),
    forecast_hours: int = Query(24, ge=1, le=48),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)
    readings = query.order_by(TelemetryReading.created_at.asc()).all()

    timestamps = []
    temps = []
    humidities = []
    for r in readings:
        timestamps.append(r.created_at.timestamp())
        temps.append(r.temperature if r.temperature else 0)
        humidities.append(r.humidity if r.humidity else 0)

    forecast_labels = []
    forecast_temps = []
    forecast_humid = []

    if len(temps) > 1:
        n = len(temps)
        sum_x = sum(range(n))
        sum_y = sum(temps)
        sum_xy = sum(i * temps[i] for i in range(n))
        sum_x2 = sum(i * i for i in range(n))
        denom = n * sum_x2 - sum_x * sum_x

        if denom != 0:
            slope = (n * sum_xy - sum_x * sum_y) / denom
            intercept = (sum_y - slope * sum_x) / n
            for i in range(forecast_hours):
                idx = n + i
                forecast_temps.append(round(slope * idx + intercept, 2))
                forecast_labels.append(
                    (datetime.now(timezone.utc) + timedelta(hours=i + 1)).strftime("%Y-%m-%d %H:%M")
                )

        n_h = len(humidities)
        sum_x_h = sum(range(n_h))
        sum_y_h = sum(humidities)
        sum_xy_h = sum(i * humidities[i] for i in range(n_h))
        sum_x2_h = sum(i * i for i in range(n_h))
        denom_h = n_h * sum_x2_h - sum_x_h * sum_x_h
        if denom_h != 0:
            slope_h = (n_h * sum_xy_h - sum_x_h * sum_y_h) / denom_h
            intercept_h = (sum_y_h - slope_h * sum_x_h) / n_h
            for i in range(forecast_hours):
                forecast_humid.append(round(slope_h * (n_h + i) + intercept_h, 2))

    return {
        "historical_labels": [r.created_at.strftime("%Y-%m-%d %H:%M") for r in readings[-100:]],
        "historical_temps": temps[-100:],
        "historical_humidity": humidities[-100:],
        "forecast_labels": forecast_labels,
        "forecast_temps": forecast_temps,
        "forecast_humidity": forecast_humid,
        "confidence": 0.85,
    }


@router.get("/failure-prediction")
def failure_prediction(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    predictions = []
    for device in devices:
        since = datetime.now(timezone.utc) - timedelta(hours=72)
        readings = (
            db.query(TelemetryReading)
            .filter(TelemetryReading.device_id == device.id, TelemetryReading.created_at >= since)
            .order_by(TelemetryReading.created_at.asc())
            .all()
        )
        if len(readings) < 5:
            continue

        health_scores = [r.machine_health_score for r in readings if r.machine_health_score is not None]
        temps = [r.temperature for r in readings if r.temperature is not None]
        risks = [r.risk_score for r in readings if r.risk_score is not None]

        if not health_scores:
            continue

        avg_health = sum(health_scores) / len(health_scores)
        recent_health = sum(health_scores[-5:]) / len(health_scores[-5:])
        health_decline = avg_health - recent_health

        avg_risk = sum(risks) / len(risks) if risks else 50
        avg_temp = sum(temps) / len(temps) if temps else 25

        prob = 0.0
        factors = []
        if device.status == DeviceStatus.OFFLINE:
            prob += 0.4
            factors.append("Device currently offline")
        if avg_health < 60:
            prob += 0.3
            factors.append(f"Low health score ({avg_health:.1f}%)")
        if health_decline > 10:
            prob += 0.2
            factors.append(f"Health declining ({health_decline:.1f}% drop)")
        if avg_risk > 70:
            prob += 0.15
            factors.append(f"High risk score ({avg_risk:.1f})")
        if device.battery_level < 20:
            prob += 0.15
            factors.append(f"Low battery ({device.battery_level:.0f}%)")
        if device.latency_ms > 500:
            prob += 0.1
            factors.append(f"High latency ({device.latency_ms:.0f}ms)")
        if avg_temp > 40 and device.device_type.value == "cold_storage":
            prob += 0.25
            factors.append(f"Cold storage overheating ({avg_temp:.1f}°C)")

        prob = min(prob, 1.0)
        if prob > 0.7:
            risk_level = "critical"
        elif prob > 0.4:
            risk_level = "high"
        elif prob > 0.2:
            risk_level = "medium"
        else:
            risk_level = "low"

        if not factors:
            factors.append("All metrics within normal range")

        hours_to_failure = round((1 - prob) * 720, 1) if prob > 0 else None

        recommendations = {
            "critical": "Immediate maintenance required. Schedule emergency inspection.",
            "high": "Schedule preventive maintenance within 24 hours.",
            "medium": "Monitor closely. Plan maintenance within this week.",
            "low": "No immediate action needed. Continue monitoring.",
        }

        predictions.append({
            "device_id": device.id,
            "device_name": device.name,
            "device_type": device.device_type.value,
            "failure_probability": round(prob, 3),
            "risk_level": risk_level,
            "predicted_failure_hours": hours_to_failure,
            "contributing_factors": factors,
            "recommendation": recommendations[risk_level],
            "health_trend": round(health_decline, 2),
            "current_health": round(avg_health, 2),
        })

    predictions.sort(key=lambda x: x["failure_probability"], reverse=True)
    return {"predictions": predictions, "total_devices": len(predictions)}


@router.get("/anomaly-detection")
def anomaly_detection(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    anomalies = []

    for device in devices:
        since = datetime.now(timezone.utc) - timedelta(hours=48)
        readings = (
            db.query(TelemetryReading)
            .filter(TelemetryReading.device_id == device.id, TelemetryReading.created_at >= since)
            .order_by(TelemetryReading.created_at.asc())
            .all()
        )
        if len(readings) < 10:
            continue

        metrics = {
            "temperature": [r.temperature for r in readings if r.temperature is not None],
            "humidity": [r.humidity for r in readings if r.humidity is not None],
            "vibration_level": [r.vibration_level for r in readings if r.vibration_level is not None],
            "gas_level": [r.gas_level for r in readings if r.gas_level is not None],
        }

        for metric_name, values in metrics.items():
            if len(values) < 10:
                continue

            mean_val = sum(values) / len(values)
            variance = sum((v - mean_val) ** 2 for v in values) / len(values)
            std_dev = variance ** 0.5

            if std_dev == 0:
                continue

            latest_val = values[-1]
            z_score = abs(latest_val - mean_val) / std_dev

            threshold_map = {
                "temperature": (mean_val - 2.5 * std_dev, mean_val + 2.5 * std_dev),
                "humidity": (mean_val - 2 * std_dev, mean_val + 2 * std_dev),
                "vibration_level": (mean_val - 2 * std_dev, mean_val + 2 * std_dev),
                "gas_level": (mean_val - 2.5 * std_dev, mean_val + 2.5 * std_dev),
            }
            low, high = threshold_map.get(metric_name, (mean_val - 2 * std_dev, mean_val + 2 * std_dev))

            if z_score > 2.5:
                severity = "critical"
            elif z_score > 2.0:
                severity = "high"
            elif z_score > 1.5:
                severity = "medium"
            else:
                continue

            if latest_val > high:
                direction = "above"
            elif latest_val < low:
                direction = "below"
            else:
                continue

            readable = metric_name.replace("_", " ").title()
            anomalies.append({
                "device_id": device.id,
                "device_name": device.name,
                "device_type": device.device_type.value,
                "anomaly_type": f"{readable} {direction} normal range",
                "severity": severity,
                "description": f"{readable} is {latest_val:.2f} ({direction} expected range of {low:.2f}-{high:.2f})",
                "detected_at": readings[-1].created_at.strftime("%Y-%m-%d %H:%M"),
                "metric_name": metric_name,
                "metric_value": round(latest_val, 2),
                "expected_range": {"min": round(low, 2), "max": round(high, 2)},
                "z_score": round(z_score, 2),
                "mean": round(mean_val, 2),
                "std_dev": round(std_dev, 2),
            })

    anomalies.sort(key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x["severity"], 3))
    return {"anomalies": anomalies, "total_anomalies": len(anomalies)}
