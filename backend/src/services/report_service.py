from uuid import UUID
from typing import Optional
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Report, SensorReading, Alert, Device, Analytics


async def generate_report(
    db: AsyncSession,
    report_type: str,
    device_id: Optional[UUID] = None,
    zone: Optional[str] = None,
) -> Report:
    title = f"{report_type.title()} Report"
    content = {}

    if report_type == "daily":
        title = f"Daily Report - {datetime.utcnow().strftime('%Y-%m-%d')}"
        content = await _generate_daily_report(db, device_id, zone)
    elif report_type == "weekly":
        title = f"Weekly Report - {datetime.utcnow().strftime('%Y-W%W')}"
        content = await _generate_weekly_report(db, device_id, zone)
    elif report_type == "monthly":
        title = f"Monthly Report - {datetime.utcnow().strftime('%Y-%m')}"
        content = await _generate_monthly_report(db, device_id, zone)
    elif report_type == "compliance":
        title = "Compliance Report"
        content = await _generate_compliance_report(db, device_id, zone)
    elif report_type == "risk":
        title = "Risk Assessment Report"
        content = await _generate_risk_report(db, device_id, zone)
    elif report_type == "maintenance":
        title = "Maintenance Report"
        content = await _generate_maintenance_report(db, device_id, zone)
    else:
        title = f"{report_type.title()} Report"
        content = {"message": "Generic report"}

    report = Report(
        device_id=device_id,
        zone=zone,
        report_type=report_type,
        title=title,
        content=content,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def _generate_daily_report(db: AsyncSession, device_id, zone) -> dict:
    query = select(SensorReading)
    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)

    result = await db.execute(query.order_by(SensorReading.created_at.desc()).limit(288))
    readings = result.scalars().all()

    if not readings:
        return {"message": "No readings found for this period"}

    temps = [r.temperature for r in readings]
    humids = [r.humidity for r in readings]

    alert_result = await db.execute(
        select(func.count(Alert.id)).where(Alert.resolved == False)
    )
    alert_count = alert_result.scalar()

    return {
        "period": datetime.utcnow().strftime("%Y-%m-%d"),
        "total_readings": len(readings),
        "temperature": {"avg": round(sum(temps) / len(temps), 2), "min": round(min(temps), 2), "max": round(max(temps), 2)},
        "humidity": {"avg": round(sum(humids) / len(humids), 2), "min": round(min(humids), 2), "max": round(max(humids), 2)},
        "active_alerts": alert_count,
        "door_open_events": sum(1 for r in readings if r.door_open),
        "power_failures": sum(1 for r in readings if not r.power_available),
    }


async def _generate_weekly_report(db, device_id, zone) -> dict:
    return await _generate_daily_report(db, device_id, zone)


async def _generate_monthly_report(db, device_id, zone) -> dict:
    return await _generate_daily_report(db, device_id, zone)


async def _generate_compliance_report(db, device_id, zone) -> dict:
    query = select(SensorReading)
    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)

    result = await db.execute(query.limit(1000))
    readings = result.scalars().all()

    out_of_range = sum(1 for r in readings if r.temperature < 0 or r.temperature > 8)
    total = len(readings) or 1

    return {
        "compliance_rate": round((1 - out_of_range / total) * 100, 2),
        "total_readings": total,
        "out_of_range_readings": out_of_range,
        "temperature_range": "0°C - 8°C",
        "status": "COMPLIANT" if out_of_range == 0 else "NON-COMPLIANT",
    }


async def _generate_risk_report(db, device_id, zone) -> dict:
    query = select(SensorReading)
    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)

    result = await db.execute(query.order_by(SensorReading.created_at.desc()).limit(100))
    readings = result.scalars().all()

    if not readings:
        return {"message": "No data available"}

    risk_scores = [r.risk_score for r in readings]
    return {
        "avg_risk_score": round(sum(risk_scores) / len(risk_scores), 2),
        "max_risk_score": max(risk_scores),
        "min_risk_score": min(risk_scores),
        "high_risk_count": sum(1 for r in risk_scores if r > 60),
        "readings_analyzed": len(readings),
    }


async def _generate_maintenance_report(db, device_id, zone) -> dict:
    query = select(SensorReading)
    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if zone:
        query = query.where(SensorReading.zone == zone)

    result = await db.execute(query.order_by(SensorReading.created_at.desc()).limit(100))
    readings = result.scalars().all()

    if not readings:
        return {"message": "No data available"}

    compressor_currents = [r.compressor_current for r in readings if r.compressor_on]
    return {
        "total_readings": len(readings),
        "compressor_readings": len(compressor_currents),
        "avg_compressor_current": round(sum(compressor_currents) / len(compressor_currents), 2) if compressor_currents else 0,
        "max_compressor_current": round(max(compressor_currents), 2) if compressor_currents else 0,
        "power_failures": sum(1 for r in readings if not r.power_available),
        "door_events": sum(1 for r in readings if r.door_open),
    }


async def list_reports(db: AsyncSession, skip=0, limit=100):
    query = select(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reports = result.scalars().all()

    count_result = await db.execute(select(func.count(Report.id)))
    total = count_result.scalar()
    return reports, total


async def get_report(db: AsyncSession, report_id: UUID):
    result = await db.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()
