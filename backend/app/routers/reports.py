from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
import io
import csv

from ..database import get_db
from ..models import TelemetryReading, Device, Alert

router = APIRouter()


@router.get("/daily")
def daily_report(
    device_id: Optional[int] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if date:
        target = datetime.fromisoformat(date)
    else:
        target = datetime.now(timezone.utc)

    start = target.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    query = db.query(TelemetryReading).filter(
        TelemetryReading.created_at >= start,
        TelemetryReading.created_at < end
    )
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)

    readings = query.all()
    temps = [r.temperature for r in readings if r.temperature is not None]
    humidities = [r.humidity for r in readings if r.humidity is not None]

    return {
        "report_type": "daily",
        "date": start.isoformat(),
        "total_readings": len(readings),
        "temperature_avg": round(sum(temps) / len(temps), 2) if temps else None,
        "temperature_min": round(min(temps), 2) if temps else None,
        "temperature_max": round(max(temps), 2) if temps else None,
        "humidity_avg": round(sum(humidities) / len(humidities), 2) if humidities else None,
        "alerts_count": db.query(func.count(Alert.id)).filter(
            Alert.created_at >= start, Alert.created_at < end
        ).scalar(),
    }


@router.get("/weekly")
def weekly_report(
    device_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=7)

    query = db.query(TelemetryReading).filter(
        TelemetryReading.created_at >= start,
        TelemetryReading.created_at <= end
    )
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)

    readings = query.all()
    temps = [r.temperature for r in readings if r.temperature is not None]

    return {
        "report_type": "weekly",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "total_readings": len(readings),
        "temperature_avg": round(sum(temps) / len(temps), 2) if temps else None,
        "alerts_count": db.query(func.count(Alert.id)).filter(
            Alert.created_at >= start, Alert.created_at <= end
        ).scalar(),
    }


@router.get("/monthly")
def monthly_report(
    device_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)

    query = db.query(TelemetryReading).filter(
        TelemetryReading.created_at >= start,
        TelemetryReading.created_at <= end
    )
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)

    readings = query.all()
    temps = [r.temperature for r in readings if r.temperature is not None]

    return {
        "report_type": "monthly",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "total_readings": len(readings),
        "temperature_avg": round(sum(temps) / len(temps), 2) if temps else None,
        "alerts_count": db.query(func.count(Alert.id)).filter(
            Alert.created_at >= start, Alert.created_at <= end
        ).scalar(),
    }


@router.get("/export/excel")
def export_excel(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    from openpyxl import Workbook

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)
    readings = query.order_by(TelemetryReading.created_at.desc()).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "IoT Telemetry Data"
    headers = [
        "ID", "Device ID", "Timestamp", "Temperature", "Humidity",
        "Power Status", "Gas Level", "Water pH", "Water Turbidity",
        "Water TDS", "Vibration", "Health Score", "Water Quality Score", "Risk Score"
    ]
    ws.append(headers)

    for r in readings:
        ws.append([
            r.id, r.device_id, r.created_at.isoformat(),
            r.temperature, r.humidity, r.power_status,
            r.gas_level, r.water_ph, r.water_turbidity,
            r.water_tds, r.vibration_level, r.machine_health_score,
            r.water_quality_score, r.risk_score
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=iot_telemetry_report.xlsx"}
    )


@router.get("/export/csv")
def export_csv(
    device_id: Optional[int] = None,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = db.query(TelemetryReading).filter(TelemetryReading.created_at >= since)
    if device_id:
        query = query.filter(TelemetryReading.device_id == device_id)
    readings = query.order_by(TelemetryReading.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Device ID", "Timestamp", "Temperature", "Humidity",
        "Power Status", "Gas Level", "Water pH", "Water Turbidity",
        "Water TDS", "Vibration", "Health Score", "Water Quality Score", "Risk Score"
    ])
    for r in readings:
        writer.writerow([
            r.id, r.device_id, r.created_at.isoformat(),
            r.temperature, r.humidity, r.power_status,
            r.gas_level, r.water_ph, r.water_turbidity,
            r.water_tds, r.vibration_level, r.machine_health_score,
            r.water_quality_score, r.risk_score
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=iot_telemetry_report.csv"}
    )
