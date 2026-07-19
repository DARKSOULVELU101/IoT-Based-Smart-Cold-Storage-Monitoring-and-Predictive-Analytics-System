from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.controllers import reading_controller
from src.services.device_service import auto_create_device
from src.services.alert_service import evaluate_alerts


async def ingest_reading(db: AsyncSession, payload: dict):
    device = await auto_create_device(db, payload["deviceId"], payload["zone"])

    reading = await reading_controller.create_reading(db, device, payload)

    alerts = await evaluate_alerts(db, device, reading)

    return {
        "reading_id": str(reading.id),
        "device_id": str(device.id),
        "device_external_id": device.device_id,
        "alerts_generated": len(alerts),
        "alerts": [
            {"id": str(a.id), "level": a.level.value, "message": a.message}
            for a in alerts
        ],
    }


async def list_readings(db: AsyncSession, device_id: Optional[UUID] = None, zone: Optional[str] = None, start_date=None, end_date=None, skip: int = 0, limit: int = 100):
    return await reading_controller.list_readings(db, device_id=device_id, zone=zone, start_date=start_date, end_date=end_date, skip=skip, limit=limit)


async def get_latest_readings(db: AsyncSession):
    return await reading_controller.get_latest_readings(db)


async def get_readings_for_device(db: AsyncSession, device_id: UUID, limit: int = 100):
    return await reading_controller.get_readings_for_device(db, device_id, limit=limit)


async def get_all_readings(db: AsyncSession, device_id=None, zone=None, start_date=None, end_date=None):
    return await reading_controller.get_all_readings_for_analytics(db, device_id=device_id, zone=zone, start_date=start_date, end_date=end_date)
