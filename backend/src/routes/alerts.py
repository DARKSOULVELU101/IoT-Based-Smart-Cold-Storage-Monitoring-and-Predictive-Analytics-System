from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from src.database.connection import get_db
from src.database.models import Alert, AlertRule

router = APIRouter(tags=["Alerts"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


class AlertRuleCreate(BaseModel):
    name: str
    module_type: str
    alert_type: str
    severity: str
    threshold_field: str
    threshold_operator: str
    threshold_value: float


@router.get("/api/alerts")
async def get_alerts(
    device_id: Optional[str] = Query(None),
    module_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    query = select(Alert)
    conditions = []
    if device_id:
        conditions.append(Alert.device_id == device_id)
    if module_type and module_type in VALID_MODULE_TYPES:
        conditions.append(Alert.module_type == module_type)
    if severity:
        conditions.append(Alert.severity == severity)
    if status_filter == "active":
        conditions.append(Alert.acknowledged == False)
    elif status_filter == "acknowledged":
        conditions.append(Alert.acknowledged == True)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return {
        "alerts": [
            {
                "id": str(a.id),
                "device_id": a.device_id,
                "module_type": a.module_type,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "acknowledged": a.acknowledged,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            }
            for a in alerts
        ],
        "count": len(alerts),
    }


@router.get("/api/alerts/active")
async def get_active_alerts(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Alert).where(Alert.acknowledged == False)
    if module_type and module_type in VALID_MODULE_TYPES:
        query = query.where(Alert.module_type == module_type)
    query = query.order_by(desc(Alert.created_at))
    result = await db.execute(query)
    alerts = result.scalars().all()
    return {
        "alerts": [
            {
                "id": str(a.id),
                "device_id": a.device_id,
                "module_type": a.module_type,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "acknowledged": a.acknowledged,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
        "count": len(alerts),
    }


@router.put("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    await db.flush()
    return {"message": "Alert acknowledged", "id": str(alert.id)}


@router.delete("/api/alerts/{alert_id}", status_code=status.HTTP_200_OK)
async def delete_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    await db.delete(alert)
    await db.flush()
    return {"message": "Alert deleted"}


@router.post("/api/alerts/rules", status_code=status.HTTP_201_CREATED)
async def create_alert_rule(request: AlertRuleCreate, db: AsyncSession = Depends(get_db)):
    if request.threshold_operator not in (">", "<", ">=", "<=", "==", "!="):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid operator")
    if request.module_type not in VALID_MODULE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid module_type")

    rule = AlertRule(
        name=request.name,
        module_type=request.module_type,
        alert_type=request.alert_type,
        severity=request.severity,
        threshold_field=request.threshold_field,
        threshold_operator=request.threshold_operator,
        threshold_value=request.threshold_value,
    )
    db.add(rule)
    await db.flush()
    await db.refresh(rule)
    return {
        "id": str(rule.id),
        "name": rule.name,
        "module_type": rule.module_type,
        "alert_type": rule.alert_type,
        "severity": rule.severity,
        "threshold_field": rule.threshold_field,
        "threshold_operator": rule.threshold_operator,
        "threshold_value": rule.threshold_value,
        "enabled": rule.enabled,
    }


@router.get("/api/alerts/rules")
async def get_alert_rules(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(AlertRule)
    if module_type and module_type in VALID_MODULE_TYPES:
        query = query.where(AlertRule.module_type == module_type)
    query = query.order_by(AlertRule.created_at.desc())
    result = await db.execute(query)
    rules = result.scalars().all()
    return {
        "rules": [
            {
                "id": str(r.id),
                "name": r.name,
                "module_type": r.module_type,
                "alert_type": r.alert_type,
                "severity": r.severity,
                "threshold_field": r.threshold_field,
                "threshold_operator": r.threshold_operator,
                "threshold_value": r.threshold_value,
                "enabled": r.enabled,
            }
            for r in rules
        ],
        "count": len(rules),
    }
