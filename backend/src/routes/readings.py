from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func
from src.database.connection import get_db
from src.database.models import SensorReading, Device
from src.controllers.device_controller import register_device
from src.services.alert_service import evaluate_alerts

router = APIRouter(tags=["Readings"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


class ColdStorageReading(BaseModel):
    deviceId: str
    zone: str
    temperature: float
    humidity: float
    doorOpen: bool = False
    doorOpenSeconds: int = 0
    gasLevel: int = 0
    compressorCurrent: float = 0.0
    compressorOn: bool = False
    powerAvailable: bool = True
    riskScore: int = 0
    status: str = "SAFE"


class MachineHealthReading(BaseModel):
    deviceId: str
    zone: str
    vibration: float
    temperature: float
    current: float
    voltage: float
    rpm: float = 0.0
    riskScore: int = 0
    status: str = "SAFE"


class WaterQualityReading(BaseModel):
    deviceId: str
    zone: str
    ph: float
    tds: float
    turbidity: float = 0.0
    chlorine: float = 0.0
    flowRate: float = 0.0
    waterLevel: float = 100.0
    riskScore: int = 0
    status: str = "SAFE"


class WarehouseReading(BaseModel):
    deviceId: str
    zone: str
    temperature: float
    humidity: float
    motionDetected: bool = False
    airQuality: float = 100.0
    occupancy: int = 0
    lux: float = 0.0
    riskScore: int = 0
    status: str = "SAFE"


class GenericReadingRequest(BaseModel):
    module_type: str = "cold_storage"
    data: dict


async def _process_reading(db, device_id, zone, module_type, reading_kwargs):
    await register_device(db, {"deviceId": device_id, "zone": zone, "module_type": module_type})
    reading = SensorReading(device_id=device_id, module_type=module_type, **reading_kwargs)
    db.add(reading)
    await db.flush()
    await db.refresh(reading)
    await evaluate_alerts(db, reading)
    return {
        "id": str(reading.id),
        "device_id": reading.device_id,
        "module_type": reading.module_type,
        "risk_score": reading.risk_score,
        "status": reading.status,
        "created_at": reading.created_at.isoformat() if reading.created_at else None,
    }


@router.post("/api/readings", status_code=status.HTTP_201_CREATED)
async def create_reading(request: GenericReadingRequest, db: AsyncSession = Depends(get_db)):
    module_type = request.module_type if request.module_type in VALID_MODULE_TYPES else "cold_storage"
    data = request.data
    device_id = data.get("deviceId", data.get("device_id", ""))
    zone = data.get("zone", "UNKNOWN")
    if not device_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="deviceId is required")

    kwargs = {
        "temperature": data.get("temperature", 0.0),
        "humidity": data.get("humidity", 0.0),
        "risk_score": data.get("riskScore", data.get("risk_score", 0)),
        "status": data.get("status", "SAFE"),
    }

    if module_type == "cold_storage":
        kwargs.update({
            "door_open": data.get("doorOpen", data.get("door_open", False)),
            "door_open_seconds": data.get("doorOpenSeconds", data.get("door_open_seconds", 0)),
            "gas_level": data.get("gasLevel", data.get("gas_level", 0)),
            "compressor_current": data.get("compressorCurrent", data.get("compressor_current", 0.0)),
            "compressor_on": data.get("compressorOn", data.get("compressor_on", False)),
            "power_available": data.get("powerAvailable", data.get("power_available", True)),
        })
    elif module_type == "machine_health":
        kwargs.update({
            "vibration": data.get("vibration", 0.0),
            "current": data.get("current", 0.0),
            "voltage": data.get("voltage", 0.0),
            "rpm": data.get("rpm", 0.0),
        })
    elif module_type == "water_quality":
        kwargs.update({
            "ph": data.get("ph", 7.0),
            "tds": data.get("tds", 0.0),
            "turbidity": data.get("turbidity", 0.0),
            "chlorine": data.get("chlorine", 0.0),
            "flow_rate": data.get("flowRate", data.get("flow_rate", 0.0)),
            "water_level": data.get("waterLevel", data.get("water_level", 100.0)),
        })
    elif module_type == "warehouse":
        kwargs.update({
            "temperature": data.get("temperature", 0.0),
            "humidity": data.get("humidity", 0.0),
            "motion_detected": data.get("motionDetected", data.get("motion_detected", False)),
            "air_quality": data.get("airQuality", data.get("air_quality", 100.0)),
            "occupancy": data.get("occupancy", 0),
            "lux": data.get("lux", 0.0),
        })

    return await _process_reading(db, device_id, zone, module_type, kwargs)


@router.post("/api/readings/cold-storage", status_code=status.HTTP_201_CREATED)
async def create_cold_storage_reading(request: ColdStorageReading, db: AsyncSession = Depends(get_db)):
    return await _process_reading(db, request.deviceId, request.zone, "cold_storage", {
        "temperature": request.temperature,
        "humidity": request.humidity,
        "door_open": request.doorOpen,
        "door_open_seconds": request.doorOpenSeconds,
        "gas_level": request.gasLevel,
        "compressor_current": request.compressorCurrent,
        "compressor_on": request.compressorOn,
        "power_available": request.powerAvailable,
        "risk_score": request.riskScore,
        "status": request.status,
    })


@router.post("/api/readings/machine-health", status_code=status.HTTP_201_CREATED)
async def create_machine_health_reading(request: MachineHealthReading, db: AsyncSession = Depends(get_db)):
    return await _process_reading(db, request.deviceId, request.zone, "machine_health", {
        "vibration": request.vibration,
        "temperature": request.temperature,
        "current": request.current,
        "voltage": request.voltage,
        "rpm": request.rpm,
        "risk_score": request.riskScore,
        "status": request.status,
    })


@router.post("/api/readings/water-quality", status_code=status.HTTP_201_CREATED)
async def create_water_quality_reading(request: WaterQualityReading, db: AsyncSession = Depends(get_db)):
    return await _process_reading(db, request.deviceId, request.zone, "water_quality", {
        "ph": request.ph,
        "tds": request.tds,
        "turbidity": request.turbidity,
        "chlorine": request.chlorine,
        "flow_rate": request.flowRate,
        "water_level": request.waterLevel,
        "risk_score": request.riskScore,
        "status": request.status,
    })


@router.post("/api/readings/warehouse", status_code=status.HTTP_201_CREATED)
async def create_warehouse_reading(request: WarehouseReading, db: AsyncSession = Depends(get_db)):
    return await _process_reading(db, request.deviceId, request.zone, "warehouse", {
        "temperature": request.temperature,
        "humidity": request.humidity,
        "motion_detected": request.motionDetected,
        "air_quality": request.airQuality,
        "occupancy": request.occupancy,
        "lux": request.lux,
        "risk_score": request.riskScore,
        "status": request.status,
    })


@router.get("/api/readings")
async def get_readings(
    device_id: Optional[str] = Query(None),
    module_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(SensorReading)
    conditions = []
    if device_id:
        conditions.append(SensorReading.device_id == device_id)
    if module_type and module_type in VALID_MODULE_TYPES:
        conditions.append(SensorReading.module_type == module_type)
    if start_date:
        try:
            sd = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            conditions.append(SensorReading.created_at >= sd)
        except ValueError:
            pass
    if end_date:
        try:
            ed = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            conditions.append(SensorReading.created_at <= ed)
        except ValueError:
            pass
    if conditions:
        query = query.where(and_(*conditions))
    query = query.order_by(desc(SensorReading.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    readings = result.scalars().all()

    return {
        "readings": [
            {
                "id": str(r.id),
                "device_id": r.device_id,
                "module_type": r.module_type,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "door_open": r.door_open,
                "door_open_seconds": r.door_open_seconds,
                "power_available": r.power_available,
                "gas_level": r.gas_level,
                "compressor_current": r.compressor_current,
                "compressor_on": r.compressor_on,
                "vibration": r.vibration,
                "current": r.current,
                "voltage": r.voltage,
                "rpm": r.rpm,
                "ph": r.ph,
                "tds": r.tds,
                "turbidity": r.turbidity,
                "chlorine": r.chlorine,
                "flow_rate": r.flow_rate,
                "water_level": r.water_level,
                "motion_detected": r.motion_detected,
                "air_quality": r.air_quality,
                "occupancy": r.occupancy,
                "lux": r.lux,
                "risk_score": r.risk_score,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in readings
        ],
        "count": len(readings),
        "limit": limit,
        "offset": offset,
    }


@router.get("/api/readings/latest")
async def get_latest_readings(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Device)
    if module_type and module_type in VALID_MODULE_TYPES:
        query = query.where(Device.module_type == module_type)
    devices_result = await db.execute(query)
    devices = devices_result.scalars().all()
    latest_readings = []
    for device in devices:
        result = await db.execute(
            select(SensorReading)
            .where(SensorReading.device_id == device.device_id)
            .order_by(desc(SensorReading.created_at))
            .limit(1)
        )
        reading = result.scalar_one_or_none()
        if reading:
            latest_readings.append({
                "device_id": reading.device_id,
                "module_type": reading.module_type,
                "temperature": reading.temperature,
                "humidity": reading.humidity,
                "door_open": reading.door_open,
                "door_open_seconds": reading.door_open_seconds,
                "power_available": reading.power_available,
                "gas_level": reading.gas_level,
                "compressor_current": reading.compressor_current,
                "compressor_on": reading.compressor_on,
                "vibration": reading.vibration,
                "current": reading.current,
                "voltage": reading.voltage,
                "rpm": reading.rpm,
                "ph": reading.ph,
                "tds": reading.tds,
                "turbidity": reading.turbidity,
                "chlorine": reading.chlorine,
                "flow_rate": reading.flow_rate,
                "water_level": reading.water_level,
                "motion_detected": reading.motion_detected,
                "air_quality": reading.air_quality,
                "occupancy": reading.occupancy,
                "lux": reading.lux,
                "risk_score": reading.risk_score,
                "status": reading.status,
                "created_at": reading.created_at.isoformat() if reading.created_at else None,
            })
    return {"readings": latest_readings, "count": len(latest_readings)}


@router.get("/api/readings/{device_id}")
async def get_device_readings(
    device_id: str,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device_id)
        .order_by(desc(SensorReading.created_at))
        .offset(offset)
        .limit(limit)
    )
    readings = result.scalars().all()
    return {
        "readings": [
            {
                "id": str(r.id),
                "device_id": r.device_id,
                "module_type": r.module_type,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "door_open": r.door_open,
                "door_open_seconds": r.door_open_seconds,
                "power_available": r.power_available,
                "gas_level": r.gas_level,
                "compressor_current": r.compressor_current,
                "compressor_on": r.compressor_on,
                "vibration": r.vibration,
                "current": r.current,
                "voltage": r.voltage,
                "rpm": r.rpm,
                "ph": r.ph,
                "tds": r.tds,
                "turbidity": r.turbidity,
                "chlorine": r.chlorine,
                "flow_rate": r.flow_rate,
                "water_level": r.water_level,
                "motion_detected": r.motion_detected,
                "air_quality": r.air_quality,
                "occupancy": r.occupancy,
                "lux": r.lux,
                "risk_score": r.risk_score,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in readings
        ],
        "count": len(readings),
    }


@router.get("/api/readings/stats/summary")
async def get_reading_stats(
    module_type: Optional[str] = Query(None),
    device_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(SensorReading)
    conditions = []
    if device_id:
        conditions.append(SensorReading.device_id == device_id)
    if module_type and module_type in VALID_MODULE_TYPES:
        conditions.append(SensorReading.module_type == module_type)
    if conditions:
        query = query.where(and_(*conditions))
    result = await db.execute(query)
    readings = result.scalars().all()

    if not readings:
        return {"message": "No readings found", "stats": {}}

    temps = [r.temperature for r in readings if r.temperature is not None]
    humids = [r.humidity for r in readings if r.humidity is not None]
    risks = [r.risk_score for r in readings]

    stats = {
        "total_readings": len(readings),
        "module_type": module_type or "all",
        "device_id": device_id or "all",
    }

    if temps:
        stats["temperature"] = {
            "avg": round(sum(temps) / len(temps), 2),
            "min": round(min(temps), 2),
            "max": round(max(temps), 2),
        }
    if humids:
        stats["humidity"] = {
            "avg": round(sum(humids) / len(humids), 2),
            "min": round(min(humids), 2),
            "max": round(max(humids), 2),
        }
    if risks:
        stats["risk_score"] = {
            "avg": round(sum(risks) / len(risks), 2),
            "min": min(risks),
            "max": max(risks),
        }

    return {"stats": stats}
