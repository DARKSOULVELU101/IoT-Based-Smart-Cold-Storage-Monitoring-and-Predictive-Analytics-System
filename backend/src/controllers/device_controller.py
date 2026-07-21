from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from src.database.models import Device, SensorReading, DeviceGroup


async def register_device(db: AsyncSession, device_data: dict) -> Device:
    result = await db.execute(select(Device).where(Device.device_id == device_data["deviceId"]))
    existing = result.scalar_one_or_none()
    if existing:
        existing.last_heartbeat = datetime.utcnow()
        if device_data.get("zone"):
            existing.zone = device_data["zone"]
        if device_data.get("module_type"):
            existing.module_type = device_data["module_type"]
        if device_data.get("group_name"):
            existing.group_name = device_data["group_name"]
        if device_data.get("ip_address"):
            existing.ip_address = device_data["ip_address"]
        if device_data.get("mac_address"):
            existing.mac_address = device_data["mac_address"]
        if device_data.get("firmware_version"):
            existing.firmware_version = device_data["firmware_version"]
        await db.flush()
        await db.refresh(existing)
        return existing

    device = Device(
        device_id=device_data["deviceId"],
        zone=device_data.get("zone", "UNKNOWN"),
        name=device_data.get("name", device_data["deviceId"]),
        module_type=device_data.get("module_type", "cold_storage"),
        group_name=device_data.get("group_name"),
        firmware_version=device_data.get("firmware_version"),
        ip_address=device_data.get("ip_address"),
        mac_address=device_data.get("mac_address"),
        status="active",
        last_heartbeat=datetime.utcnow(),
    )
    db.add(device)
    await db.flush()
    await db.refresh(device)
    return device


async def get_devices(
    db: AsyncSession,
    module_type: str = None,
    device_status: str = None,
    group_name: str = None,
) -> List[dict]:
    query = select(Device)
    conditions = []
    if module_type:
        conditions.append(Device.module_type == module_type)
    if device_status:
        conditions.append(Device.status == device_status)
    if group_name:
        conditions.append(Device.group_name == group_name)
    if conditions:
        query = query.where(and_(*conditions))
    query = query.order_by(desc(Device.last_heartbeat))
    result = await db.execute(query)
    devices = result.scalars().all()
    output = []
    for d in devices:
        latest = await db.execute(
            select(SensorReading)
            .where(SensorReading.device_id == d.device_id)
            .order_by(desc(SensorReading.created_at))
            .limit(1)
        )
        latest_reading = latest.scalar_one_or_none()
        output.append({
            "id": str(d.id),
            "device_id": d.device_id,
            "zone": d.zone,
            "name": d.name,
            "module_type": d.module_type,
            "group_name": d.group_name,
            "status": d.status,
            "firmware_version": d.firmware_version,
            "ip_address": d.ip_address,
            "mac_address": d.mac_address,
            "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
            "latest_reading": {
                "temperature": latest_reading.temperature if latest_reading else None,
                "humidity": latest_reading.humidity if latest_reading else None,
                "risk_score": latest_reading.risk_score if latest_reading else None,
                "status": latest_reading.status if latest_reading else None,
            } if latest_reading else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    return output


async def get_device(db: AsyncSession, device_id: str) -> Optional[dict]:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    d = result.scalar_one_or_none()
    if not d:
        return None

    latest = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(desc(SensorReading.created_at))
        .limit(1)
    )
    latest_reading = latest.scalar_one_or_none()
    return {
        "id": str(d.id),
        "device_id": d.device_id,
        "zone": d.zone,
        "name": d.name,
        "module_type": d.module_type,
        "group_name": d.group_name,
        "status": d.status,
        "firmware_version": d.firmware_version,
        "ip_address": d.ip_address,
        "mac_address": d.mac_address,
        "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
        "latest_reading": {
            "temperature": latest_reading.temperature,
            "humidity": latest_reading.humidity,
            "door_open": latest_reading.door_open,
            "gas_level": latest_reading.gas_level,
            "compressor_on": latest_reading.compressor_on,
            "risk_score": latest_reading.risk_score,
            "status": latest_reading.status,
            "vibration": latest_reading.vibration,
            "current": latest_reading.current,
            "voltage": latest_reading.voltage,
            "ph": latest_reading.ph,
            "tds": latest_reading.tds,
            "air_quality": latest_reading.air_quality,
            "occupancy": latest_reading.occupancy,
        } if latest_reading else None,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


async def update_device(db: AsyncSession, device_id: str, data: dict) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return None
    for key, value in data.items():
        if hasattr(device, key) and value is not None:
            setattr(device, key, value)
    device.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(device)
    return device


async def delete_device(db: AsyncSession, device_id: str) -> bool:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return False
    await db.delete(device)
    await db.flush()
    return True


async def enable_device(db: AsyncSession, device_id: str) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return None
    device.status = "active"
    device.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(device)
    return device


async def disable_device(db: AsyncSession, device_id: str) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return None
    device.status = "disabled"
    device.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(device)
    return device


async def get_device_health(db: AsyncSession, device_id: str) -> Optional[dict]:
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return None

    count_result = await db.execute(
        select(func.count(SensorReading.id)).where(SensorReading.device_id == device_id)
    )
    reading_count = count_result.scalar() or 0

    latest = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(desc(SensorReading.created_at))
        .limit(1)
    )
    latest_reading = latest.scalar_one_or_none()

    heartbeat_age = None
    if device.last_heartbeat:
        heartbeat_age = (datetime.utcnow() - device.last_heartbeat).total_seconds()

    is_healthy = device.status == "active" and heartbeat_age is not None and heartbeat_age < 300

    return {
        "device_id": device.device_id,
        "status": device.status,
        "module_type": device.module_type,
        "is_healthy": is_healthy,
        "last_heartbeat": device.last_heartbeat.isoformat() if device.last_heartbeat else None,
        "heartbeat_age_seconds": heartbeat_age,
        "total_readings": reading_count,
        "latest_status": latest_reading.status if latest_reading else None,
        "created_at": device.created_at.isoformat() if device.created_at else None,
    }


async def discover_devices(db: AsyncSession) -> List[dict]:
    result = await db.execute(
        select(Device).where(
            and_(
                Device.last_heartbeat >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
                Device.status == "active",
            )
        )
    )
    devices = result.scalars().all()
    return [
        {
            "device_id": d.device_id,
            "name": d.name,
            "zone": d.zone,
            "module_type": d.module_type,
            "ip_address": d.ip_address,
            "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
        }
        for d in devices
    ]


async def get_device_groups(db: AsyncSession) -> List[dict]:
    result = await db.execute(select(DeviceGroup).order_by(DeviceGroup.name))
    groups = result.scalars().all()
    output = []
    for g in groups:
        device_count_result = await db.execute(
            select(func.count(Device.id)).where(Device.group_name == g.name)
        )
        device_count = device_count_result.scalar() or 0
        output.append({
            "id": str(g.id),
            "name": g.name,
            "description": g.description,
            "module_type": g.module_type,
            "device_count": device_count,
            "created_at": g.created_at.isoformat() if g.created_at else None,
        })
    return output


async def create_device_group(
    db: AsyncSession, name: str, description: str = None, module_type: str = None
) -> DeviceGroup:
    existing = await db.execute(select(DeviceGroup).where(DeviceGroup.name == name))
    if existing.scalar_one_or_none():
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail=f"Group '{name}' already exists")

    group = DeviceGroup(
        name=name,
        description=description,
        module_type=module_type,
    )
    db.add(group)
    await db.flush()
    await db.refresh(group)
    return group
