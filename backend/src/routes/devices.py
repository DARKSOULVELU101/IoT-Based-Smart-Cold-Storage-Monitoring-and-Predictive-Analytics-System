from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from src.database.connection import get_db
from src.database.models import Device
from src.controllers.device_controller import (
    register_device, get_devices, get_device, update_device,
    delete_device, enable_device, disable_device, get_device_health,
    discover_devices, get_device_groups, create_device_group,
)

router = APIRouter(tags=["Devices"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


class DeviceRegisterRequest(BaseModel):
    deviceId: str
    zone: str
    name: Optional[str] = None
    module_type: Optional[str] = "cold_storage"
    group_name: Optional[str] = None
    firmware_version: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None


class DeviceUpdateRequest(BaseModel):
    zone: Optional[str] = None
    name: Optional[str] = None
    status: Optional[str] = None
    module_type: Optional[str] = None
    group_name: Optional[str] = None
    firmware_version: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None


class DeviceGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None
    module_type: Optional[str] = None


@router.post("/api/device/register", status_code=status.HTTP_201_CREATED)
async def api_register_device(request: DeviceRegisterRequest, db: AsyncSession = Depends(get_db)):
    module_type = request.module_type if request.module_type in VALID_MODULE_TYPES else "cold_storage"
    device = await register_device(db, {
        "deviceId": request.deviceId,
        "zone": request.zone,
        "name": request.name,
        "module_type": module_type,
        "group_name": request.group_name,
        "firmware_version": request.firmware_version,
        "ip_address": request.ip_address,
        "mac_address": request.mac_address,
    })
    return {
        "id": str(device.id),
        "device_id": device.device_id,
        "zone": device.zone,
        "name": device.name,
        "module_type": device.module_type,
        "group_name": device.group_name,
        "status": device.status,
    }


@router.get("/api/devices")
async def api_get_devices(
    module_type: Optional[str] = Query(None),
    device_status: Optional[str] = Query(None, alias="status"),
    group: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    devices = await get_devices(db, module_type=module_type, device_status=device_status, group_name=group)
    return {"devices": devices, "count": len(devices)}


@router.get("/api/device/{device_id}")
async def api_get_device(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


@router.put("/api/device/{device_id}")
async def api_update_device(
    device_id: str, request: DeviceUpdateRequest, db: AsyncSession = Depends(get_db)
):
    data = {k: v for k, v in request.model_dump().items() if v is not None}
    device = await update_device(db, device_id, data)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return {
        "id": str(device.id),
        "device_id": device.device_id,
        "zone": device.zone,
        "name": device.name,
        "module_type": device.module_type,
        "group_name": device.group_name,
        "status": device.status,
    }


@router.delete("/api/device/{device_id}", status_code=status.HTTP_200_OK)
async def api_delete_device(device_id: str, db: AsyncSession = Depends(get_db)):
    deleted = await delete_device(db, device_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return {"message": "Device deleted successfully"}


@router.post("/api/device/{device_id}/enable")
async def api_enable_device(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await enable_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return {"message": "Device enabled", "device_id": device.device_id, "status": device.status}


@router.post("/api/device/{device_id}/disable")
async def api_disable_device(device_id: str, db: AsyncSession = Depends(get_db)):
    device = await disable_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return {"message": "Device disabled", "device_id": device.device_id, "status": device.status}


@router.get("/api/device/{device_id}/health")
async def api_get_device_health(device_id: str, db: AsyncSession = Depends(get_db)):
    health = await get_device_health(db, device_id)
    if not health:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return health


@router.post("/api/device/discover")
async def api_discover_devices(db: AsyncSession = Depends(get_db)):
    discovered = await discover_devices(db)
    return {"discovered": discovered, "count": len(discovered)}


@router.get("/api/device/groups")
async def api_get_device_groups(db: AsyncSession = Depends(get_db)):
    groups = await get_device_groups(db)
    return {"groups": groups, "count": len(groups)}


@router.post("/api/device/groups", status_code=status.HTTP_201_CREATED)
async def api_create_device_group(request: DeviceGroupRequest, db: AsyncSession = Depends(get_db)):
    group = await create_device_group(db, request.name, request.description, request.module_type)
    return {
        "id": str(group.id),
        "name": group.name,
        "description": group.description,
        "module_type": group.module_type,
        "created_at": group.created_at.isoformat() if group.created_at else None,
    }
