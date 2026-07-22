from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from typing import Optional, List

from ..database import get_db
from ..models import Device, TelemetryReading, DeviceConfig, DeviceStatus, DeviceType
from ..schemas import (
    DeviceCreate, DeviceUpdate, DeviceRead, DeviceConfigRead, DeviceConfigUpdate
)

router = APIRouter()


@router.get("/", response_model=List[DeviceRead])
def list_devices(
    device_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Device)
    if device_type:
        query = query.filter(Device.device_type == device_type)
    if status:
        query = query.filter(Device.status == status)
    if search:
        query = query.filter(Device.name.ilike(f"%{search}%"))
    devices = query.order_by(Device.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return devices


@router.get("/count")
def device_count(db: Session = Depends(get_db)):
    total = db.query(func.count(Device.id)).scalar()
    online = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.ONLINE).scalar()
    offline = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.OFFLINE).scalar()
    maintenance = db.query(func.count(Device.id)).filter(Device.status == DeviceStatus.MAINTENANCE).scalar()
    by_type = {}
    for dt in DeviceType:
        by_type[dt.value] = db.query(func.count(Device.id)).filter(Device.device_type == dt).scalar()
    return {
        "total": total, "online": online, "offline": offline,
        "maintenance": maintenance, "by_type": by_type
    }


@router.get("/{device_id}", response_model=DeviceRead)
def get_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.post("/", response_model=DeviceRead, status_code=201)
def create_device(device_data: DeviceCreate, db: Session = Depends(get_db)):
    device = Device(**device_data.model_dump())
    db.add(device)
    db.commit()
    db.refresh(device)
    config = DeviceConfig(device_id=device.id)
    db.add(config)
    db.commit()
    return device


@router.put("/{device_id}", response_model=DeviceRead)
def update_device(device_id: int, device_data: DeviceUpdate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    for key, value in device_data.model_dump(exclude_unset=True).items():
        setattr(device, key, value)
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
    return {"message": "Device deleted successfully"}


@router.post("/{device_id}/enable")
def enable_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.status = DeviceStatus.ONLINE
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Device enabled"}


@router.post("/{device_id}/disable")
def disable_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.status = DeviceStatus.OFFLINE
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Device disabled"}


@router.post("/{device_id}/heartbeat")
def device_heartbeat(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.last_heartbeat = datetime.now(timezone.utc)
    device.status = DeviceStatus.ONLINE
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Heartbeat recorded", "device_id": device_id}


@router.get("/{device_id}/config", response_model=DeviceConfigRead)
def get_device_config(device_id: int, db: Session = Depends(get_db)):
    config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Device config not found")
    return config


@router.put("/{device_id}/config", response_model=DeviceConfigRead)
def update_device_config(device_id: int, config_data: DeviceConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(DeviceConfig).filter(DeviceConfig.device_id == device_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Device config not found")
    for key, value in config_data.model_dump(exclude_unset=True).items():
        setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config
