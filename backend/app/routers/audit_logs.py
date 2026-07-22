from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import AuditLog
from ..schemas import AuditLogRead

router = APIRouter()


@router.get("/", response_model=list[AuditLogRead])
def list_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/stats")
def audit_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(func.count(AuditLog.id)).scalar() or 0
    by_action = {}
    for row in db.query(AuditLog.action, func.count(AuditLog.id)).group_by(AuditLog.action).all():
        by_action[row[0]] = row[1]
    by_entity = {}
    for row in db.query(AuditLog.entity_type, func.count(AuditLog.id)).group_by(AuditLog.entity_type).all():
        by_entity[row[0]] = row[1]
    return {"total": total, "by_action": by_action, "by_entity": by_entity}
