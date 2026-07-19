from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import User
from src.schemas import AlertResponse, AlertListResponse, AlertResolve
from src.services.alert_service import (
    list_alerts,
    get_active_alerts,
    resolve_alert,
    get_alert_stats,
)
from src.middleware.auth import get_current_user, require_role

router = APIRouter(tags=["Alerts"])


@router.get("/api/alerts", response_model=AlertListResponse)
async def list_all_alerts(
    zone: str = Query(None),
    level: str = Query(None),
    resolved: bool = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts, total = await list_alerts(db, zone=zone, level=level, resolved=resolved, skip=skip, limit=limit)
    return AlertListResponse(alerts=alerts, total=total)


@router.get("/api/alerts/active")
async def active_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = await get_active_alerts(db)
    return {"alerts": alerts, "total": len(alerts)}


@router.post("/api/alerts/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert_endpoint(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    alert = await resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/api/alerts/stats")
async def alert_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_alert_stats(db)
