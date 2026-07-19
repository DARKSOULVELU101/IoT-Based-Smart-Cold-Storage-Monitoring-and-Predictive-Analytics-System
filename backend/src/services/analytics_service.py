from uuid import UUID
from typing import Optional
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.controllers import analytics_controller
from src.analytics.engine import compute_analytics


async def get_dashboard_summary(db: AsyncSession):
    return await analytics_controller.get_dashboard_summary(db)


async def get_zone_comparison(db: AsyncSession):
    return await analytics_controller.get_zone_comparison(db)


async def get_risk_trends(db: AsyncSession, device_id: UUID):
    return await analytics_controller.get_risk_trends(db, device_id)


async def get_analytics(db: AsyncSession, device_id=None, zone=None, period_type=None, skip=0, limit=100):
    return await analytics_controller.get_analytics_data(db, device_id=device_id, zone=zone, period_type=period_type, skip=skip, limit=limit)


async def compute_and_store_analytics(db: AsyncSession, device_id: UUID, zone: str, readings: list):
    if not readings:
        return None

    metrics = compute_analytics(readings)

    from src.models import Analytics, PeriodType
    from sqlalchemy import select

    existing = await db.execute(
        select(Analytics).where(
            Analytics.device_id == device_id,
            Analytics.period_type == PeriodType.DAILY,
        ).order_by(Analytics.created_at.desc()).limit(1)
    )
    existing_analytics = existing.scalar_one_or_none()

    if existing_analytics:
        existing_analytics.temperature_avg = metrics["temperature_avg"]
        existing_analytics.temperature_min = metrics["temperature_min"]
        existing_analytics.temperature_max = metrics["temperature_max"]
        existing_analytics.humidity_avg = metrics["humidity_avg"]
        existing_analytics.door_open_count = metrics["door_open_count"]
        existing_analytics.door_open_duration = metrics["door_open_duration"]
        existing_analytics.compressor_runtime = metrics["compressor_runtime"]
        existing_analytics.power_failure_count = metrics["power_failure_count"]
        existing_analytics.risk_score_avg = metrics["risk_score_avg"]
        existing_analytics.energy_consumption = metrics["energy_consumption"]
        from datetime import datetime
        existing_analytics.created_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_analytics)
        return existing_analytics

    new_analytics = Analytics(
        device_id=device_id,
        zone=zone,
        period_type=PeriodType.DAILY,
        temperature_avg=metrics["temperature_avg"],
        temperature_min=metrics["temperature_min"],
        temperature_max=metrics["temperature_max"],
        humidity_avg=metrics["humidity_avg"],
        door_open_count=metrics["door_open_count"],
        door_open_duration=metrics["door_open_duration"],
        compressor_runtime=metrics["compressor_runtime"],
        power_failure_count=metrics["power_failure_count"],
        risk_score_avg=metrics["risk_score_avg"],
        energy_consumption=metrics["energy_consumption"],
    )
    db.add(new_analytics)
    await db.commit()
    await db.refresh(new_analytics)
    return new_analytics
