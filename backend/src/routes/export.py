from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.database import get_db
from src.models import User, SensorReading, Alert, Analytics, Report
from src.exports.excel_export import (
    export_sensor_data,
    export_alerts,
    export_analytics,
    export_reports,
)
from src.middleware.auth import get_current_user

router = APIRouter(tags=["Export"])


@router.get("/api/export/excel")
async def export_sensor_excel(
    device_id: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(SensorReading)
    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)
    if start_date:
        query = query.where(SensorReading.created_at >= start_date)
    if end_date:
        query = query.where(SensorReading.created_at <= end_date)
    query = query.order_by(SensorReading.created_at.desc()).limit(10000)

    result = await db.execute(query)
    readings = result.scalars().all()

    buffer = export_sensor_data(readings)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=sensor_data.xlsx"},
    )


@router.get("/api/export/alerts")
async def export_alerts_excel(
    zone: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Alert)
    if zone:
        query = query.where(Alert.zone == zone)
    if level:
        query = query.where(Alert.level == level)
    if resolved is not None:
        query = query.where(Alert.resolved == resolved)
    query = query.order_by(Alert.created_at.desc()).limit(10000)

    result = await db.execute(query)
    alerts = result.scalars().all()

    buffer = export_alerts(alerts)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=alerts.xlsx"},
    )


@router.get("/api/export/analytics")
async def export_analytics_excel(
    zone: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Analytics)
    if zone:
        query = query.where(Analytics.zone == zone)
    query = query.order_by(Analytics.created_at.desc()).limit(10000)

    result = await db.execute(query)
    analytics = result.scalars().all()

    buffer = export_analytics(analytics)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=analytics.xlsx"},
    )


@router.get("/api/export/reports")
async def export_reports_excel(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Report).order_by(Report.created_at.desc()).limit(10000)
    result = await db.execute(query)
    reports = result.scalars().all()

    buffer = export_reports(reports)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reports.xlsx"},
    )
