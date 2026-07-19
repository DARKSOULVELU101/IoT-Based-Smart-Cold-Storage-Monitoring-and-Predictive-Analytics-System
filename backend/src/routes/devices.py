from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import User
from src.schemas import DeviceCreate, DeviceUpdate, DeviceResponse, DeviceListResponse
from src.services import device_service
from src.middleware.auth import get_current_user, require_role

router = APIRouter(tags=["Devices"])


@router.post("/api/device/register", response_model=DeviceResponse)
async def register_device(
    data: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    device = await device_service.get_device_by_external_id(db, data.device_id)
    if device:
        raise HTTPException(status_code=409, detail=f"Device '{data.device_id}' already registered")
    return await device_service.register_device(db, data)


@router.get("/api/devices", response_model=DeviceListResponse)
async def list_devices(
    zone: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    devices, total = await device_service.list_devices(db, zone=zone, status=status, skip=skip, limit=limit)
    return DeviceListResponse(devices=devices, total=total)


@router.get("/api/devices/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.put("/api/devices/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: UUID,
    data: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return await device_service.update_device(db, device, data)


@router.delete("/api/devices/{device_id}")
async def delete_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await device_service.delete_device(db, device)
    return {"message": "Device deleted successfully"}


@router.post("/api/devices/{device_id}/enable", response_model=DeviceResponse)
async def enable_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return await device_service.enable_device(db, device)


@router.post("/api/devices/{device_id}/disable", response_model=DeviceResponse)
async def disable_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return await device_service.disable_device(db, device)


@router.get("/api/devices/{device_id}/health")
async def device_health(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    device = await device_service.get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return await device_service.get_device_health(db, device)
