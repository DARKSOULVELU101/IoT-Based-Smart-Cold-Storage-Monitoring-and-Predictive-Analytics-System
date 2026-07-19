from uuid import UUID
from typing import Optional, List
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Device, SensorReading, Alert, DeviceStatus
from src.schemas import DeviceCreate, DeviceUpdate, DeviceResponse


async def create_device(db: AsyncSession, data: DeviceCreate) -> Device:
    device = Device(
        device_id=data.device_id,
        zone=data.zone,
        name=data.name,
        description=data.description,
        status=DeviceStatus.ACTIVE,
        last_heartbeat=datetime.utcnow(),
    )
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device


async def get_device_by_device_id(db: AsyncSession, device_id_str: str) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.device_id == device_id_str))
    return result.scalar_one_or_none()


async def get_device_by_id(db: AsyncSession, device_id: UUID) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.id == device_id))
    return result.scalar_one_or_none()


async def list_devices(
    db: AsyncSession,
    zone: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple:
    query = select(Device)
    count_query = select(func.count(Device.id))

    if zone:
        query = query.where(Device.zone == zone)
        count_query = count_query.where(Device.zone == zone)
    if status:
        query = query.where(Device.status == status)
        count_query = count_query.where(Device.status == status)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Device.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    devices = result.scalars().all()
    return devices, total


async def update_device(db: AsyncSession, device: Device, data: DeviceUpdate) -> Device:
    if data.zone is not None:
        device.zone = data.zone
    if data.name is not None:
        device.name = data.name
    if data.description is not None:
        device.description = data.description
    if data.status is not None:
        device.status = DeviceStatus(data.status)
    device.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(device)
    return device


async def delete_device(db: AsyncSession, device: Device):
    await db.delete(device)
    await db.commit()


async def enable_device(db: AsyncSession, device: Device) -> Device:
    device.status = DeviceStatus.ACTIVE
    device.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(device)
    return device


async def disable_device(db: AsyncSession, device: Device) -> Device:
    device.status = DeviceStatus.DISABLED
    device.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(device)
    return device


async def get_device_health(db: AsyncSession, device: Device) -> dict:
    last_reading_result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device.id)
        .order_by(SensorReading.created_at.desc())
        .limit(1)
    )
    last_reading = last_reading_result.scalar_one_or_none()

    alert_count_result = await db.execute(
        select(func.count(Alert.id)).where(
            Alert.device_id == device.id,
            Alert.resolved == False,
        )
    )
    active_alerts = alert_count_result.scalar()

    reading_count_result = await db.execute(
        select(func.count(SensorReading.id)).where(SensorReading.device_id == device.id)
    )
    total_readings = reading_count_result.scalar()

    return {
        "device_id": device.device_id,
        "status": device.status.value,
        "last_heartbeat": device.last_heartbeat.isoformat() if device.last_heartbeat else None,
        "active_alerts": active_alerts,
        "total_readings": total_readings,
        "last_reading": {
            "temperature": last_reading.temperature,
            "humidity": last_reading.humidity,
            "risk_score": last_reading.risk_score,
            "status": last_reading.status,
            "created_at": last_reading.created_at.isoformat(),
        } if last_reading else None,
    }


async def auto_create_device(db: AsyncSession, device_id_str: str, zone: str) -> Device:
    existing = await get_device_by_device_id(db, device_id_str)
    if existing:
        existing.last_heartbeat = datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        return existing

    new_device = Device(
        device_id=device_id_str,
        zone=zone,
        name=f"Auto-detected {device_id_str}",
        description=f"Auto-registered from telemetry in zone {zone}",
        status=DeviceStatus.ACTIVE,
        last_heartbeat=datetime.utcnow(),
    )
    db.add(new_device)
    await db.commit()
    await db.refresh(new_device)
    return new_device
