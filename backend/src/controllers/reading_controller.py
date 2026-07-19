from uuid import UUID
from typing import Optional, List
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import SensorReading, Device


async def create_reading(db: AsyncSession, device: Device, data: dict) -> SensorReading:
    reading = SensorReading(
        device_id=device.id,
        zone=data["zone"],
        temperature=data["temperature"],
        humidity=data["humidity"],
        door_open=data.get("doorOpen", False),
        door_open_seconds=data.get("doorOpenSeconds", 0),
        power_available=data.get("powerAvailable", True),
        gas_level=data.get("gasLevel", 0),
        compressor_current=data.get("compressorCurrent", 0.0),
        compressor_on=data.get("compressorOn", False),
        risk_score=data.get("riskScore", 0),
        status=data.get("status", "SAFE"),
        created_at=datetime.utcnow(),
    )
    db.add(reading)
    await db.commit()
    await db.refresh(reading)
    return reading


async def list_readings(
    db: AsyncSession,
    device_id: Optional[UUID] = None,
    zone: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple:
    query = select(SensorReading)
    count_query = select(func.count(SensorReading.id))

    if device_id:
        query = query.where(SensorReading.device_id == device_id)
        count_query = count_query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)
        count_query = count_query.where(SensorReading.zone == zone)
    if start_date:
        query = query.where(SensorReading.created_at >= start_date)
        count_query = count_query.where(SensorReading.created_at >= start_date)
    if end_date:
        query = query.where(SensorReading.created_at <= end_date)
        count_query = count_query.where(SensorReading.created_at <= end_date)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(SensorReading.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    readings = result.scalars().all()
    return readings, total


async def get_latest_readings(db: AsyncSession) -> list:
    subq = (
        select(
            SensorReading.device_id,
            func.max(SensorReading.created_at).label("max_created"),
        )
        .group_by(SensorReading.device_id)
        .subquery()
    )
    query = (
        select(SensorReading)
        .join(
            subq,
            (SensorReading.device_id == subq.c.device_id)
            & (SensorReading.created_at == subq.c.max_created),
        )
    )
    result = await db.execute(query)
    return result.scalars().all()


async def get_readings_for_device(
    db: AsyncSession,
    device_id: UUID,
    limit: int = 100,
    skip: int = 0,
) -> list:
    query = (
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(SensorReading.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


async def get_all_readings_for_analytics(
    db: AsyncSession,
    device_id: Optional[UUID] = None,
    zone: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> list:
    query = select(SensorReading)

    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)
    if start_date:
        query = query.where(SensorReading.created_at >= start_date)
    if end_date:
        query = query.where(SensorReading.created_at <= end_date)

    query = query.order_by(SensorReading.created_at.asc())
    result = await db.execute(query)
    return result.scalars().all()
