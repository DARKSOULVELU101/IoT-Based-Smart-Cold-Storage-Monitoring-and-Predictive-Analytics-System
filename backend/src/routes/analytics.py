from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import User
from src.schemas import AnalyticsResponse, AnalyticsListResponse, DashboardSummary, ZoneComparison
from src.services import analytics_service
from src.analytics.predictive import (
    predict_spoilage_risk,
    predict_compressor_failure,
    detect_abnormal_temperature,
    predict_future_temperature,
    predict_future_humidity,
)
from src.middleware.auth import get_current_user
from src.services.reading_service import get_all_readings

router = APIRouter(tags=["Analytics"])


@router.get("/api/analytics", response_model=AnalyticsListResponse)
async def get_analytics(
    device_id: Optional[UUID] = Query(None),
    zone: Optional[str] = Query(None),
    period_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics, total = await analytics_service.get_analytics(
        db, device_id=device_id, zone=zone, period_type=period_type, skip=skip, limit=limit
    )
    return AnalyticsListResponse(analytics=analytics, total=total)


@router.get("/api/analytics/summary")
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_dashboard_summary(db)


@router.get("/api/analytics/zones")
async def zone_comparison(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_zone_comparison(db)


@router.get("/api/analytics/trends/{device_id}")
async def risk_trends(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await analytics_service.get_risk_trends(db, device_id)


@router.get("/api/analytics/predictions/{device_id}")
async def predictions(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    readings = await get_all_readings(db, device_id=device_id)

    if not readings:
        raise HTTPException(status_code=404, detail="No readings found for this device")

    return {
        "device_id": str(device_id),
        "spoilage_risk": predict_spoilage_risk(readings),
        "compressor_failure": predict_compressor_failure(readings),
        "abnormal_temperature": detect_abnormal_temperature(readings),
        "future_temperature": predict_future_temperature(readings),
        "future_humidity": predict_future_humidity(readings),
    }
