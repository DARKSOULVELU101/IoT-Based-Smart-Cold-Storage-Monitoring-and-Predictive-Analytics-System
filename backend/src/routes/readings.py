from uuid import UUID
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.schemas import ReadingCreate, ReadingResponse, ReadingListResponse
from src.services import reading_service

router = APIRouter(tags=["Readings"])


@router.post("/api/readings")
async def ingest_reading(
    payload: ReadingCreate,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await reading_service.ingest_reading(db, payload.model_dump())
        return {
            "message": "Reading ingested successfully",
            **result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest reading: {str(e)}")


@router.get("/api/readings", response_model=ReadingListResponse)
async def list_readings(
    device_id: Optional[UUID] = Query(None),
    zone: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    readings, total = await reading_service.list_readings(
        db, device_id=device_id, zone=zone, start_date=start_date, end_date=end_date, skip=skip, limit=limit
    )
    return ReadingListResponse(readings=readings, total=total)


@router.get("/api/readings/latest")
async def latest_readings(db: AsyncSession = Depends(get_db)):
    readings = await reading_service.get_latest_readings(db)
    return {"readings": readings, "total": len(readings)}


@router.get("/api/readings/{device_id}")
async def readings_for_device(
    device_id: UUID,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    readings = await reading_service.get_readings_for_device(db, device_id, limit=limit)
    return {"readings": readings, "total": len(readings)}
