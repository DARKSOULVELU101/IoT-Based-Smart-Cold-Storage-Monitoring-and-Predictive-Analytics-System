from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from typing import Optional, List

from ..database import get_db
from ..models import Alert, Device, AlertType, AlertSeverity
from ..schemas import AlertCreate, AlertRead

router = APIRouter()


@router.get("/", response_model=List[AlertRead])
def list_alerts(
    device_id: Optional[int] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Alert)
    if device_id:
        query = query.filter(Alert.device_id == device_id)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)

    alerts_q = query.order_by(Alert.created_at.desc())
    total = alerts_q.count()
    alerts = alerts_q.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for a in alerts:
        device = db.query(Device).filter(Device.id == a.device_id).first()
        alert_data = AlertRead(
            id=a.id, device_id=a.device_id, alert_type=a.alert_type,
            severity=a.severity, message=a.message, is_resolved=a.is_resolved,
            resolved_at=a.resolved_at, created_at=a.created_at,
            device_name=device.name if device else "Unknown"
        )
        result.append(alert_data)
    return result


@router.get("/stats")
def alert_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Alert.id)).scalar()
    active = db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar()
    resolved = db.query(func.count(Alert.id)).filter(Alert.is_resolved == True).scalar()

    by_severity = {}
    for sev in AlertSeverity:
        by_severity[sev.value] = db.query(func.count(Alert.id)).filter(
            Alert.severity == sev, Alert.is_resolved == False
        ).scalar()

    by_type = {}
    for at in AlertType:
        by_type[at.value] = db.query(func.count(Alert.id)).filter(
            Alert.alert_type == at, Alert.is_resolved == False
        ).scalar()

    return {
        "total": total,
        "active": active,
        "resolved": resolved,
        "by_severity": by_severity,
        "by_type": by_type,
    }


@router.post("/", response_model=AlertRead, status_code=201)
def create_alert(alert_data: AlertCreate, db: Session = Depends(get_db)):
    alert = Alert(**alert_data.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)

    device = db.query(Device).filter(Device.id == alert.device_id).first()
    return AlertRead(
        id=alert.id, device_id=alert.device_id, alert_type=alert.alert_type,
        severity=alert.severity, message=alert.message, is_resolved=alert.is_resolved,
        resolved_at=alert.resolved_at, created_at=alert.created_at,
        device_name=device.name if device else "Unknown"
    )


@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Alert resolved"}


@router.post("/resolve-all")
def resolve_all_alerts(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_resolved == False).update({
        "is_resolved": True,
        "resolved_at": datetime.now(timezone.utc)
    })
    db.commit()
    return {"message": "All alerts resolved"}
