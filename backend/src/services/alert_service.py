from typing import List
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Alert, AlertLevel, SensorReading, Device


TEMPERATURE_HIGH_THRESHOLD = 8.0
TEMPERATURE_LOW_THRESHOLD = 2.0
HUMIDITY_HIGH_THRESHOLD = 70.0
DOOR_OPEN_THRESHOLD_SECONDS = 15
GAS_LEAK_THRESHOLD = 2600
COMPRESSOR_CURRENT_HIGH_THRESHOLD = 8.0
RISK_SCORE_HIGH_THRESHOLD = 60


async def evaluate_alerts(db: AsyncSession, device: Device, reading: SensorReading) -> List[Alert]:
    alerts_created = []

    checks = [
        ("TEMPERATURE_HIGH", reading.temperature > TEMPERATURE_HIGH_THRESHOLD, AlertLevel.WARNING, f"High temperature: {reading.temperature}°C (threshold: {TEMPERATURE_HIGH_THRESHOLD}°C)"),
        ("TEMPERATURE_LOW", reading.temperature < TEMPERATURE_LOW_THRESHOLD, AlertLevel.WARNING, f"Low temperature: {reading.temperature}°C (threshold: {TEMPERATURE_LOW_THRESHOLD}°C)"),
        ("HUMIDITY_HIGH", reading.humidity > HUMIDITY_HIGH_THRESHOLD, AlertLevel.WARNING, f"High humidity: {reading.humidity}% (threshold: {HUMIDITY_HIGH_THRESHOLD}%)"),
        ("DOOR_LEFT_OPEN", reading.door_open and reading.door_open_seconds > DOOR_OPEN_THRESHOLD_SECONDS, AlertLevel.WARNING, f"Door left open for {reading.door_open_seconds}s (threshold: {DOOR_OPEN_THRESHOLD_SECONDS}s)"),
        ("GAS_LEAK", reading.gas_level > GAS_LEAK_THRESHOLD, AlertLevel.CRITICAL, f"Gas level: {reading.gas_level}ppm (threshold: {GAS_LEAK_THRESHOLD}ppm)"),
        ("POWER_FAILURE", not reading.power_available, AlertLevel.CRITICAL, "Power failure detected"),
        ("COMPRESSOR_FAILURE", reading.compressor_current > COMPRESSOR_CURRENT_HIGH_THRESHOLD, AlertLevel.CRITICAL, f"Compressor overcurrent: {reading.compressor_current}A (threshold: {COMPRESSOR_CURRENT_HIGH_THRESHOLD}A)"),
        ("HIGH_RISK_SCORE", reading.risk_score > RISK_SCORE_HIGH_THRESHOLD, AlertLevel.CRITICAL, f"High risk score: {reading.risk_score} (threshold: {RISK_SCORE_HIGH_THRESHOLD})"),
    ]

    for alert_type, condition, level, message in checks:
        if condition:
            existing = await db.execute(
                select(Alert).where(
                    Alert.device_id == device.id,
                    Alert.alert_type == alert_type,
                    Alert.resolved == False,
                ).limit(1)
            )
            existing_alert = existing.scalar_one_or_none()

            if not existing_alert:
                alert = Alert(
                    device_id=device.id,
                    zone=reading.zone,
                    alert_type=alert_type,
                    level=level,
                    message=message,
                    resolved=False,
                    created_at=datetime.utcnow(),
                )
                db.add(alert)
                alerts_created.append(alert)

    if alerts_created:
        await db.commit()
        for alert in alerts_created:
            await db.refresh(alert)

    return alerts_created


async def list_alerts(
    db: AsyncSession,
    device_id=None,
    zone=None,
    level=None,
    resolved=None,
    skip=0,
    limit=100,
):
    from sqlalchemy import select, func

    query = select(Alert)
    count_query = select(func.count(Alert.id))

    if device_id:
        query = query.where(Alert.device_id == device_id)
        count_query = count_query.where(Alert.device_id == device_id)
    if zone:
        query = query.where(Alert.zone == zone)
        count_query = count_query.where(Alert.zone == zone)
    if level:
        query = query.where(Alert.level == level)
        count_query = count_query.where(Alert.level == level)
    if resolved is not None:
        query = query.where(Alert.resolved == resolved)
        count_query = count_query.where(Alert.resolved == resolved)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()
    return alerts, total


async def get_active_alerts(db: AsyncSession):
    query = select(Alert).where(Alert.resolved == False).order_by(Alert.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def resolve_alert(db: AsyncSession, alert_id):
    from sqlalchemy import select
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        return None
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(alert)
    return alert


async def get_alert_stats(db: AsyncSession):
    from sqlalchemy import select

    level_counts = {}
    for level_val in ["info", "warning", "critical"]:
        result = await db.execute(
            select(func.count(Alert.id)).where(
                Alert.level == level_val,
                Alert.resolved == False,
            )
        )
        level_counts[level_val] = result.scalar()

    type_counts_result = await db.execute(
        select(Alert.alert_type, func.count(Alert.id))
        .where(Alert.resolved == False)
        .group_by(Alert.alert_type)
    )
    type_counts = {row[0]: row[1] for row in type_counts_result.all()}

    return {
        "by_level": level_counts,
        "by_type": type_counts,
        "total_active": sum(level_counts.values()),
    }
