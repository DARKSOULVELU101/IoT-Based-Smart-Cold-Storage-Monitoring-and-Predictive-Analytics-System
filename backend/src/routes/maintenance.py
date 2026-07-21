from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from src.database.connection import get_db
from src.database.models import MaintenanceSchedule, Device

router = APIRouter(tags=["Maintenance"])


class MaintenanceScheduleCreate(BaseModel):
    device_id: str
    task_name: str
    task_type: str
    interval_days: int
    notes: Optional[str] = None


class MaintenanceScheduleUpdate(BaseModel):
    task_name: Optional[str] = None
    task_type: Optional[str] = None
    interval_days: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None


@router.get("/api/maintenance/schedules")
async def get_maintenance_schedules(
    device_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(MaintenanceSchedule)
    if device_id:
        query = query.where(MaintenanceSchedule.device_id == device_id)
    if status_filter:
        query = query.where(MaintenanceSchedule.status == status_filter)
    query = query.order_by(MaintenanceSchedule.next_due)
    result = await db.execute(query)
    schedules = result.scalars().all()

    return {
        "schedules": [
            {
                "id": str(s.id),
                "device_id": s.device_id,
                "task_name": s.task_name,
                "task_type": s.task_type,
                "interval_days": s.interval_days,
                "last_performed": s.last_performed.isoformat() if s.last_performed else None,
                "next_due": s.next_due.isoformat() if s.next_due else None,
                "status": s.status,
                "notes": s.notes,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in schedules
        ],
        "count": len(schedules),
    }


@router.post("/api/maintenance/schedules", status_code=status.HTTP_201_CREATED)
async def create_maintenance_schedule(
    request: MaintenanceScheduleCreate,
    db: AsyncSession = Depends(get_db),
):
    device_result = await db.execute(select(Device).where(Device.device_id == request.device_id))
    device = device_result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    next_due = datetime.utcnow() + timedelta(days=request.interval_days)

    schedule = MaintenanceSchedule(
        device_id=request.device_id,
        task_name=request.task_name,
        task_type=request.task_type,
        interval_days=request.interval_days,
        next_due=next_due,
        status="pending",
        notes=request.notes,
    )
    db.add(schedule)
    await db.flush()
    await db.refresh(schedule)

    return {
        "id": str(schedule.id),
        "device_id": schedule.device_id,
        "task_name": schedule.task_name,
        "task_type": schedule.task_type,
        "interval_days": schedule.interval_days,
        "next_due": schedule.next_due.isoformat() if schedule.next_due else None,
        "status": schedule.status,
        "notes": schedule.notes,
        "created_at": schedule.created_at.isoformat() if schedule.created_at else None,
    }


@router.put("/api/maintenance/schedules/{schedule_id}")
async def update_maintenance_schedule(
    schedule_id: str,
    request: MaintenanceScheduleUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MaintenanceSchedule).where(MaintenanceSchedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")

    if request.task_name is not None:
        schedule.task_name = request.task_name
    if request.task_type is not None:
        schedule.task_type = request.task_type
    if request.interval_days is not None:
        schedule.interval_days = request.interval_days
        schedule.next_due = datetime.utcnow() + timedelta(days=request.interval_days)
    if request.notes is not None:
        schedule.notes = request.notes
    if request.status is not None:
        schedule.status = request.status

    schedule.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(schedule)

    return {
        "id": str(schedule.id),
        "device_id": schedule.device_id,
        "task_name": schedule.task_name,
        "task_type": schedule.task_type,
        "interval_days": schedule.interval_days,
        "next_due": schedule.next_due.isoformat() if schedule.next_due else None,
        "status": schedule.status,
        "notes": schedule.notes,
        "created_at": schedule.created_at.isoformat() if schedule.created_at else None,
    }


@router.post("/api/maintenance/{device_id}/trigger")
async def trigger_maintenance(
    device_id: str,
    task_name: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    device_result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = device_result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    query = select(MaintenanceSchedule).where(MaintenanceSchedule.device_id == device_id)
    if task_name:
        query = query.where(MaintenanceSchedule.task_name == task_name)
    query = query.where(MaintenanceSchedule.status == "pending")
    result = await db.execute(query)
    schedules = result.scalars().all()

    updated = []
    for schedule in schedules:
        schedule.status = "completed"
        schedule.last_performed = datetime.utcnow()
        schedule.next_due = datetime.utcnow() + timedelta(days=schedule.interval_days)
        schedule.updated_at = datetime.utcnow()
        updated.append({
            "id": str(schedule.id),
            "task_name": schedule.task_name,
            "next_due": schedule.next_due.isoformat(),
        })

    await db.flush()

    return {
        "device_id": device_id,
        "completed_count": len(updated),
        "updated_schedules": updated,
        "message": f"Maintenance triggered for {len(updated)} tasks",
    }
