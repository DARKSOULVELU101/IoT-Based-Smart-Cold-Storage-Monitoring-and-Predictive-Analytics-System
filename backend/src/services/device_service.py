from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.controllers import device_controller
from src.schemas import DeviceCreate, DeviceUpdate


async def register_device(db: AsyncSession, data: DeviceCreate):
    existing = await device_controller.get_device_by_device_id(db, data.device_id)
    if existing:
        return existing
    return await device_controller.create_device(db, data)


async def get_device(db: AsyncSession, device_id: UUID):
    return await device_controller.get_device_by_id(db, device_id)


async def get_device_by_external_id(db: AsyncSession, device_id_str: str):
    return await device_controller.get_device_by_device_id(db, device_id_str)


async def list_devices(db: AsyncSession, zone: Optional[str] = None, status: Optional[str] = None, skip: int = 0, limit: int = 100):
    return await device_controller.list_devices(db, zone=zone, status=status, skip=skip, limit=limit)


async def update_device(db: AsyncSession, device, data: DeviceUpdate):
    return await device_controller.update_device(db, device, data)


async def delete_device(db: AsyncSession, device):
    return await device_controller.delete_device(db, device)


async def enable_device(db: AsyncSession, device):
    return await device_controller.enable_device(db, device)


async def disable_device(db: AsyncSession, device):
    return await device_controller.disable_device(db, device)


async def get_device_health(db: AsyncSession, device):
    return await device_controller.get_device_health(db, device)


async def auto_create_device(db: AsyncSession, device_id_str: str, zone: str):
    return await device_controller.auto_create_device(db, device_id_str, zone)
