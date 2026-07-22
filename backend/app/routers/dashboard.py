from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from ..database import get_db
from ..models import Device, TelemetryReading, Alert, DeviceStatus
from ..schemas import DashboardSummary, TelemetryRead, AlertRead

router = APIRouter()


@router.get("/", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Device.id)).scalar()
    online = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.ONLINE).scalar()
    offline = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.OFFLINE).scalar()
    maintenance = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.MAINTENANCE).scalar()

    active_alerts = db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar()
    critical_alerts = db.query(func.count(Alert.id)).filter(
        Alert.is_resolved == False, Alert.severity == "critical"
    ).scalar()

    subq = (
        db.query(
            TelemetryReading.device_id,
            func.max(TelemetryReading.id).label("max_id")
        )
        .group_by(TelemetryReading.device_id)
        .subquery()
    )
    latest_readings_db = (
        db.query(TelemetryReading)
        .join(subq, TelemetryReading.id == subq.c.max_id)
        .all()
    )
    latest_readings = [TelemetryRead.model_validate(r) for r in latest_readings_db]

    temps = [r.temperature for r in latest_readings_db if r.temperature is not None]
    humidities = [r.humidity for r in latest_readings_db if r.humidity is not None]
    health_scores = [r.machine_health_score for r in latest_readings_db if r.machine_health_score is not None]
    wq_scores = [r.water_quality_score for r in latest_readings_db if r.water_quality_score is not None]
    risk_scores = [r.risk_score for r in latest_readings_db if r.risk_score is not None]

    recent_alerts_db = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(10)
        .all()
    )
    recent_alerts = []
    for a in recent_alerts_db:
        device = db.query(Device).filter(Device.id == a.device_id).first()
        recent_alerts.append(AlertRead(
            id=a.id, device_id=a.device_id, alert_type=a.alert_type,
            severity=a.severity, message=a.message, is_resolved=a.is_resolved,
            resolved_at=a.resolved_at, created_at=a.created_at,
            device_name=device.name if device else "Unknown"
        ))

    device_type_counts = {}
    for dt in ["cold_storage", "machine_water", "warehouse"]:
        device_type_counts[dt] = db.query(func.count(Device.id)).filter(
            Device.device_type == dt
        ).scalar()

    return DashboardSummary(
        total_devices=total,
        online_devices=online,
        offline_devices=offline,
        maintenance_devices=maintenance,
        latest_readings=latest_readings,
        active_alerts=active_alerts,
        critical_alerts=critical_alerts,
        avg_temperature=round(sum(temps) / len(temps), 2) if temps else None,
        avg_humidity=round(sum(humidities) / len(humidities), 2) if humidities else None,
        avg_machine_health=round(sum(health_scores) / len(health_scores), 2) if health_scores else None,
        avg_water_quality=round(sum(wq_scores) / len(wq_scores), 2) if wq_scores else None,
        avg_risk_score=round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None,
        recent_alerts=recent_alerts,
        device_type_counts=device_type_counts,
    )
