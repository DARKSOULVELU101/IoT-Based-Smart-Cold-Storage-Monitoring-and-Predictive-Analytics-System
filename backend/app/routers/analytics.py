from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import statistics

from ..database import get_db
from ..models import TelemetryReading, Device
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
