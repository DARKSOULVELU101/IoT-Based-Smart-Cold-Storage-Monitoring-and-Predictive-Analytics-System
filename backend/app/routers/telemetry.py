from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from ..database import get_db
from ..models import TelemetryReading, Device, DeviceStatus
from ..schemas import TelemetryCreate, TelemetryRead

router = APIRouter()


@router.post("/ingest", response_model=TelemetryRead, status_code=201)
def ingest_telemetry(data: TelemetryCreate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    reading = TelemetryReading(**data.model_dump())
    db.add(reading)

    device.status = DeviceStatus.ONLINE
    device.last_heartbeat = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reading)
    return reading


@router.post("/batch", status_code=201)
def ingest_batch(readings: List[TelemetryCreate], db: Session = Depends(get_db)):
    created = []
    for data in readings:
        device = db.query(Device).filter(Device.id == data.device_id).first()
        if not device:
            continue
        reading = TelemetryReading(**data.model_dump())
        db.add(reading)
        device.status = DeviceStatus.ONLINE
        device.last_heartbeat = datetime.now(timezone.utc)
        created.append(reading)
    db.commit()
    return {"message": f"{len(created)} readings ingested", "count": len(created)}


@router.get("/latest/{device_id}", response_model=Optional[TelemetryRead])
def get_latest_telemetry(device_id: int, db: Session = Depends(get_db)):
    reading = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.device_id == device_id)
        .order_by(TelemetryReading.created_at.desc())
        .first()
    )
    if not reading:
        raise HTTPException(status_code=404, detail="No readings found")
    return reading


@router.get("/latest", response_model=List[TelemetryRead])
def get_all_latest(db: Session = Depends(get_db)):
    subq = (
        db.query(
            TelemetryReading.device_id,
            func.max(TelemetryReading.id).label("max_id")
        )
        .group_by(TelemetryReading.device_id)
        .subquery()
    )
    readings = (
        db.query(TelemetryReading)
        .join(subq, TelemetryReading.id == subq.c.max_id)
        .all()
    )
    return readings


@router.get("/{device_id}", response_model=List[TelemetryRead])
def get_telemetry_history(
    device_id: int,
    start: Optional[str] = None,
    end: Optional[str] = None,
    limit: int = Query(100, ge=1, le=10000),
    db: Session = Depends(get_db),
):
    query = db.query(TelemetryReading).filter(TelemetryReading.device_id == device_id)
    if start:
        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        query = query.filter(TelemetryReading.created_at >= start_dt)
    if end:
        end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
        query = query.filter(TelemetryReading.created_at <= end_dt)
    readings = query.order_by(TelemetryReading.created_at.desc()).limit(limit).all()
    return readings


@router.get("/stats/summary")
def telemetry_summary(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)

    stats = query.with_entities(
        func.avg(TelemetryReading.temperature),
        func.min(TelemetryReading.temperature),
        func.max(TelemetryReading.temperature),
        func.avg(TelemetryReading.humidity),
        func.min(TelemetryReading.humidity),
        func.max(TelemetryReading.humidity),
        func.avg(TelemetryReading.gas_level),
        func.avg(TelemetryReading.vibration_level),
        func.avg(TelemetryReading.water_ph),
        func.avg(TelemetryReading.water_turbidity),
        func.avg(TelemetryReading.water_tds),
        func.count(TelemetryReading.id),
    ).first()

    return {
        "period_hours": hours,
        "total_readings": stats[11] if stats[11] else 0,
        "temperature": {
            "avg": round(stats[0], 2) if stats[0] else None,
            "min": round(stats[1], 2) if stats[1] else None,
            "max": round(stats[2], 2) if stats[2] else None,
        },
        "humidity": {
            "avg": round(stats[3], 2) if stats[3] else None,
            "min": round(stats[4], 2) if stats[4] else None,
            "max": round(stats[5], 2) if stats[5] else None,
        },
        "gas_level_avg": round(stats[6], 2) if stats[6] else None,
        "vibration_avg": round(stats[7], 2) if stats[7] else None,
        "water_ph_avg": round(stats[8], 2) if stats[8] else None,
        "water_turbidity_avg": round(stats[9], 2) if stats[9] else None,
        "water_tds_avg": round(stats[10], 2) if stats[10] else None,
    }
