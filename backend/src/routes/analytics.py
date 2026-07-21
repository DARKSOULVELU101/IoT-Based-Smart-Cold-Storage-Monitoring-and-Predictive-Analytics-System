from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from src.database.connection import get_db
from src.database.models import SensorReading, Analytics, Device, Alert
from src.analytics.engine import AnalyticsEngine
from src.analytics.predictive import PredictiveEngine

router = APIRouter(tags=["Analytics"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


@router.get("/api/analytics")
async def get_overall_analytics(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    devices_query = select(Device)
    if module_type and module_type in VALID_MODULE_TYPES:
        devices_query = devices_query.where(Device.module_type == module_type)
    devices_result = await db.execute(devices_query)
    devices = devices_result.scalars().all()

    total_devices = len(devices)
    active_devices = sum(1 for d in devices if d.status == "active")

    readings_query = select(func.count(SensorReading.id))
    if module_type and module_type in VALID_MODULE_TYPES:
        readings_query = readings_query.where(SensorReading.module_type == module_type)
    readings_result = await db.execute(readings_query)
    total_readings = readings_result.scalar() or 0

    alerts_query = select(func.count(Alert.id)).where(Alert.acknowledged == False)
    if module_type and module_type in VALID_MODULE_TYPES:
        alerts_query = alerts_query.where(Alert.module_type == module_type)
    alerts_result = await db.execute(alerts_query)
    active_alerts = alerts_result.scalar() or 0

    latest_readings = []
    for device in devices:
        result = await db.execute(
            select(SensorReading)
            .where(SensorReading.device_id == device.device_id)
            .order_by(desc(SensorReading.created_at))
            .limit(1)
        )
        r = result.scalar_one_or_none()
        if r:
            latest_readings.append(r)

    avg_temp = round(sum(r.temperature for r in latest_readings if r.temperature is not None) / max(len(latest_readings), 1), 2)
    avg_humidity = round(sum(r.humidity for r in latest_readings if r.humidity is not None) / max(len(latest_readings), 1), 2)
    avg_risk = round(sum(r.risk_score for r in latest_readings) / max(len(latest_readings), 1), 2)

    module_counts = {}
    for d in devices:
        module_counts[d.module_type] = module_counts.get(d.module_type, 0) + 1

    zone_counts = {}
    for d in devices:
        zone_counts[d.zone] = zone_counts.get(d.zone, 0) + 1

    return {
        "summary": {
            "total_devices": total_devices,
            "active_devices": active_devices,
            "total_readings": total_readings,
            "active_alerts": active_alerts,
            "avg_temperature": avg_temp,
            "avg_humidity": avg_humidity,
            "avg_risk_score": avg_risk,
        },
        "module_counts": module_counts,
        "zones": zone_counts,
    }


@router.get("/api/analytics/{device_id}")
async def get_device_analytics(device_id: str, db: AsyncSession = Depends(get_db)):
    engine = AnalyticsEngine(db)
    today = datetime.utcnow()
    stats = await engine.calculate_daily_stats(device_id, today)
    energy = await engine.get_energy_consumption(device_id)

    latest_result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(desc(SensorReading.created_at))
        .limit(1)
    )
    latest = latest_result.scalar_one_or_none()

    return {
        "device_id": device_id,
        "today_stats": stats,
        "energy": energy,
        "latest_reading": {
            "temperature": latest.temperature if latest else None,
            "humidity": latest.humidity if latest else None,
            "door_open": latest.door_open if latest else None,
            "risk_score": latest.risk_score if latest else None,
            "status": latest.status if latest else None,
            "vibration": latest.vibration if latest else None,
            "current": latest.current if latest else None,
            "voltage": latest.voltage if latest else None,
            "ph": latest.ph if latest else None,
            "tds": latest.tds if latest else None,
            "air_quality": latest.air_quality if latest else None,
            "occupancy": latest.occupancy if latest else None,
        } if latest else None,
    }


@router.get("/api/analytics/{device_id}/trend")
async def get_risk_trend(
    device_id: str,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    engine = AnalyticsEngine(db)
    trend = await engine.get_risk_trend(device_id, days)
    return {"device_id": device_id, "days": days, "trend": trend}


@router.get("/api/analytics/{device_id}/predict")
async def get_predictions(device_id: str, db: AsyncSession = Depends(get_db)):
    engine = PredictiveEngine(db)
    predictions = await engine.get_predictions(device_id)
    return predictions


@router.get("/api/analytics/zones/compare")
async def compare_zones(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    engine = AnalyticsEngine(db)
    comparison = await engine.get_zone_comparison(module_type=module_type)
    return {"zones": comparison, "count": len(comparison)}


@router.get("/api/analytics/modules/compare")
async def compare_modules(db: AsyncSession = Depends(get_db)):
    engine = AnalyticsEngine(db)
    comparison = await engine.get_module_comparison()
    return {"modules": comparison, "count": len(comparison)}


@router.get("/api/analytics/dashboard")
async def get_dashboard_analytics(db: AsyncSession = Depends(get_db)):
    engine = AnalyticsEngine(db)
    dashboard_data = await engine.get_dashboard_summary()
    return dashboard_data
