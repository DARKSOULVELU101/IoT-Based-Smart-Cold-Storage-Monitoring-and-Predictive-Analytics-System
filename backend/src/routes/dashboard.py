from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from src.database.connection import get_db
from src.database.models import Device, SensorReading, Alert

router = APIRouter(tags=["Dashboard"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


@router.get("/api/dashboard/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    devices_result = await db.execute(select(Device))
    devices = devices_result.scalars().all()

    total_devices = len(devices)
    active_devices = sum(1 for d in devices if d.status == "active")
    disabled_devices = sum(1 for d in devices if d.status == "disabled")

    devices_by_module = {}
    devices_by_zone = {}
    for d in devices:
        devices_by_module[d.module_type] = devices_by_module.get(d.module_type, 0) + 1
        devices_by_zone[d.zone] = devices_by_zone.get(d.zone, 0) + 1

    total_readings = 0
    for mt in VALID_MODULE_TYPES:
        count_result = await db.execute(
            select(func.count(SensorReading.id)).where(SensorReading.module_type == mt)
        )
        total_readings += count_result.scalar() or 0

    readings_by_module = {}
    for mt in VALID_MODULE_TYPES:
        count_result = await db.execute(
            select(func.count(SensorReading.id)).where(SensorReading.module_type == mt)
        )
        readings_by_module[mt] = count_result.scalar() or 0

    active_alerts_result = await db.execute(
        select(func.count(Alert.id)).where(Alert.acknowledged == False)
    )
    active_alerts = active_alerts_result.scalar() or 0

    critical_alerts_result = await db.execute(
        select(func.count(Alert.id)).where(
            and_(Alert.acknowledged == False, Alert.severity == "critical")
        )
    )
    critical_alerts = critical_alerts_result.scalar() or 0

    alerts_by_module = {}
    for mt in VALID_MODULE_TYPES:
        count_result = await db.execute(
            select(func.count(Alert.id)).where(
                and_(Alert.module_type == mt, Alert.acknowledged == False)
            )
        )
        alerts_by_module[mt] = count_result.scalar() or 0

    return {
        "total_devices": total_devices,
        "active_devices": active_devices,
        "disabled_devices": disabled_devices,
        "total_readings": total_readings,
        "readings_by_module": readings_by_module,
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "alerts_by_module": alerts_by_module,
        "devices_by_module": devices_by_module,
        "devices_by_zone": devices_by_zone,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/api/dashboard/realtime")
async def get_realtime_data(
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    devices_query = select(Device).where(Device.status == "active")
    if module_type and module_type in VALID_MODULE_TYPES:
        devices_query = devices_query.where(Device.module_type == module_type)
    devices_result = await db.execute(devices_query)
    devices = devices_result.scalars().all()

    realtime_data = []
    for device in devices:
        result = await db.execute(
            select(SensorReading)
            .where(SensorReading.device_id == device.device_id)
            .order_by(desc(SensorReading.created_at))
            .limit(1)
        )
        reading = result.scalar_one_or_none()
        if reading:
            entry = {
                "device_id": reading.device_id,
                "module_type": reading.module_type,
                "zone": device.zone,
                "name": device.name,
                "risk_score": reading.risk_score,
                "status": reading.status,
                "created_at": reading.created_at.isoformat() if reading.created_at else None,
            }
            if reading.module_type == "cold_storage":
                entry.update({
                    "temperature": reading.temperature,
                    "humidity": reading.humidity,
                    "door_open": reading.door_open,
                    "gas_level": reading.gas_level,
                    "compressor_on": reading.compressor_on,
                    "power_available": reading.power_available,
                })
            elif reading.module_type == "machine_health":
                entry.update({
                    "vibration": reading.vibration,
                    "temperature": reading.temperature,
                    "current": reading.current,
                    "voltage": reading.voltage,
                    "rpm": reading.rpm,
                })
            elif reading.module_type == "water_quality":
                entry.update({
                    "ph": reading.ph,
                    "tds": reading.tds,
                    "turbidity": reading.turbidity,
                    "chlorine": reading.chlorine,
                    "flow_rate": reading.flow_rate,
                    "water_level": reading.water_level,
                })
            elif reading.module_type == "warehouse":
                entry.update({
                    "temperature": reading.temperature,
                    "humidity": reading.humidity,
                    "motion_detected": reading.motion_detected,
                    "air_quality": reading.air_quality,
                    "occupancy": reading.occupancy,
                    "lux": reading.lux,
                })
            realtime_data.append(entry)

    return {"readings": realtime_data, "count": len(realtime_data)}


@router.get("/api/dashboard/alerts")
async def get_recent_alerts(
    limit: int = Query(20, ge=1, le=100),
    module_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Alert).where(Alert.acknowledged == False).where(Alert.severity == "critical")
    if module_type and module_type in VALID_MODULE_TYPES:
        query = query.where(Alert.module_type == module_type)
    query = query.order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return {
        "alerts": [
            {
                "id": str(a.id),
                "device_id": a.device_id,
                "module_type": a.module_type,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
        "count": len(alerts),
    }


@router.get("/api/dashboard/charts")
async def get_chart_data(
    module_type: Optional[str] = Query(None),
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)
    query = select(SensorReading).where(SensorReading.created_at >= since)
    if module_type and module_type in VALID_MODULE_TYPES:
        query = query.where(SensorReading.module_type == module_type)
    query = query.order_by(SensorReading.created_at)
    result = await db.execute(query)
    readings = result.scalars().all()

    timeline = []
    for r in readings:
        entry = {
            "timestamp": r.created_at.isoformat() if r.created_at else None,
            "device_id": r.device_id,
            "module_type": r.module_type,
            "risk_score": r.risk_score,
        }
        if r.module_type == "cold_storage":
            entry["temperature"] = r.temperature
            entry["humidity"] = r.humidity
        elif r.module_type == "machine_health":
            entry["vibration"] = r.vibration
            entry["temperature"] = r.temperature
            entry["current"] = r.current
        elif r.module_type == "water_quality":
            entry["ph"] = r.ph
            entry["tds"] = r.tds
        elif r.module_type == "warehouse":
            entry["temperature"] = r.temperature
            entry["humidity"] = r.humidity
            entry["air_quality"] = r.air_quality
            entry["occupancy"] = r.occupancy
        timeline.append(entry)

    alert_counts_by_hour = {}
    alerts_query = select(Alert).where(Alert.created_at >= since)
    if module_type and module_type in VALID_MODULE_TYPES:
        alerts_query = alerts_query.where(Alert.module_type == module_type)
    alerts_result = await db.execute(alerts_query)
    alerts = alerts_result.scalars().all()
    for a in alerts:
        hour_key = a.created_at.strftime("%Y-%m-%d %H:00") if a.created_at else "unknown"
        alert_counts_by_hour[hour_key] = alert_counts_by_hour.get(hour_key, 0) + 1

    return {
        "timeline": timeline[-500:],
        "alert_counts_by_hour": alert_counts_by_hour,
        "total_readings": len(readings),
        "total_alerts": len(alerts),
    }
