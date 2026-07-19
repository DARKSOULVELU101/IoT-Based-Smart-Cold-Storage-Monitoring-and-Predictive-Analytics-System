from uuid import UUID
from typing import Optional
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import SensorReading, Device, Alert, Analytics


async def get_dashboard_summary(db: AsyncSession) -> dict:
    total_devices_result = await db.execute(select(func.count(Device.id)))
    total_devices = total_devices_result.scalar()

    online_devices_result = await db.execute(
        select(func.count(Device.id)).where(Device.status == "active")
    )
    online_devices = online_devices_result.scalar()

    avg_temp_result = await db.execute(select(func.avg(SensorReading.temperature)))
    avg_temp = avg_temp_result.scalar() or 0.0

    avg_humidity_result = await db.execute(select(func.avg(SensorReading.humidity)))
    avg_humidity = avg_humidity_result.scalar() or 0.0

    total_alerts_result = await db.execute(select(func.count(Alert.id)).where(Alert.resolved == False))
    total_alerts = total_alerts_result.scalar()

    critical_alerts_result = await db.execute(
        select(func.count(Alert.id)).where(Alert.resolved == False, Alert.level == "critical")
    )
    critical_alerts = critical_alerts_result.scalar()

    avg_risk_result = await db.execute(select(func.avg(SensorReading.risk_score)))
    avg_risk = avg_risk_result.scalar() or 0.0

    total_readings_result = await db.execute(select(func.count(SensorReading.id)))
    total_readings = total_readings_result.scalar()

    return {
        "total_devices": total_devices,
        "online_devices": online_devices,
        "avg_temperature": round(float(avg_temp), 2),
        "avg_humidity": round(float(avg_humidity), 2),
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts,
        "avg_risk_score": round(float(avg_risk), 2),
        "total_readings": total_readings,
    }


async def get_zone_comparison(db: AsyncSession) -> list:
    zone_stats_query = (
        select(
            SensorReading.zone,
            func.count(func.distinct(SensorReading.device_id)).label("device_count"),
            func.avg(SensorReading.temperature).label("avg_temperature"),
            func.avg(SensorReading.humidity).label("avg_humidity"),
            func.avg(SensorReading.risk_score).label("avg_risk_score"),
            func.count(SensorReading.id).label("reading_count"),
        )
        .group_by(SensorReading.zone)
    )
    result = await db.execute(zone_stats_query)
    rows = result.all()

    zones = []
    for row in rows:
        alert_count_result = await db.execute(
            select(func.count(Alert.id)).where(
                Alert.zone == row.zone,
                Alert.resolved == False,
            )
        )
        alert_count = alert_count_result.scalar()

        zones.append({
            "zone": row.zone,
            "device_count": row.device_count,
            "avg_temperature": round(float(row.avg_temperature or 0), 2),
            "avg_humidity": round(float(row.avg_humidity or 0), 2),
            "avg_risk_score": round(float(row.avg_risk_score or 0), 2),
            "alert_count": alert_count,
            "reading_count": row.reading_count,
        })

    return zones


async def get_risk_trends(db: AsyncSession, device_id: UUID) -> list:
    query = (
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(SensorReading.created_at.desc())
        .limit(100)
    )
    result = await db.execute(query)
    readings = result.scalars().all()

    return [
        {
            "timestamp": r.created_at.isoformat(),
            "risk_score": r.risk_score,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "status": r.status,
        }
        for r in reversed(readings)
    ]


async def get_analytics_data(
    db: AsyncSession,
    device_id: Optional[UUID] = None,
    zone: Optional[str] = None,
    period_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple:
    query = select(Analytics)
    count_query = select(func.count(Analytics.id))

    if device_id:
        query = query.where(Analytics.device_id == device_id)
        count_query = count_query.where(Analytics.device_id == device_id)
    if zone:
        query = query.where(Analytics.zone == zone)
        count_query = count_query.where(Analytics.zone == zone)
    if period_type:
        query = query.where(Analytics.period_type == period_type)
        count_query = count_query.where(Analytics.period_type == period_type)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Analytics.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    analytics = result.scalars().all()
    return analytics, total
