from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from src.database.models import Alert, SensorReading


async def evaluate_alerts(db: AsyncSession, reading: SensorReading):
    alert_rules = []
    mt = reading.module_type or "cold_storage"

    if mt == "cold_storage":
        if reading.temperature is not None:
            if reading.temperature > 8:
                alert_rules.append({
                    "alert_type": "TEMPERATURE_HIGH",
                    "severity": "critical",
                    "message": f"Cold Storage - Temperature critically high: {reading.temperature}C (threshold: 8C)",
                })
            elif reading.temperature < 2:
                alert_rules.append({
                    "alert_type": "TEMPERATURE_LOW",
                    "severity": "warning",
                    "message": f"Cold Storage - Temperature low: {reading.temperature}C (threshold: 2C)",
                })
        if reading.humidity is not None and reading.humidity > 70:
            alert_rules.append({
                "alert_type": "HUMIDITY_HIGH",
                "severity": "warning",
                "message": f"Cold Storage - Humidity high: {reading.humidity}% (threshold: 70%)",
            })
        if reading.door_open_seconds and reading.door_open_seconds > 15:
            alert_rules.append({
                "alert_type": "DOOR_LEFT_OPEN",
                "severity": "warning",
                "message": f"Cold Storage - Door left open for {reading.door_open_seconds}s (threshold: 15s)",
            })
        if reading.gas_level and reading.gas_level > 2600:
            alert_rules.append({
                "alert_type": "GAS_LEAK",
                "severity": "critical",
                "message": f"Cold Storage - Gas leak detected: level {reading.gas_level} (threshold: 2600)",
            })
        if reading.power_available is not None and not reading.power_available:
            alert_rules.append({
                "alert_type": "POWER_FAILURE",
                "severity": "critical",
                "message": "Cold Storage - Power failure detected",
            })
        if reading.compressor_current is not None and reading.compressor_current > 8:
            alert_rules.append({
                "alert_type": "COMPRESSOR_FAULT",
                "severity": "warning",
                "message": f"Cold Storage - High compressor current: {reading.compressor_current}A (threshold: 8A)",
            })

    elif mt == "machine_health":
        if reading.vibration is not None and reading.vibration > 10.0:
            alert_rules.append({
                "alert_type": "VIBRATION_HIGH",
                "severity": "critical",
                "message": f"Machine Health - Vibration critically high: {reading.vibration}mm/s (threshold: 10mm/s)",
            })
        if reading.temperature is not None and reading.temperature > 85:
            alert_rules.append({
                "alert_type": "TEMPERATURE_HIGH",
                "severity": "critical",
                "message": f"Machine Health - Temperature critically high: {reading.temperature}C (threshold: 85C)",
            })
        if reading.current is not None and reading.current > 15:
            alert_rules.append({
                "alert_type": "CURRENT_HIGH",
                "severity": "warning",
                "message": f"Machine Health - Current high: {reading.current}A (threshold: 15A)",
            })
        if reading.voltage is not None and reading.voltage < 180:
            alert_rules.append({
                "alert_type": "VOLTAGE_LOW",
                "severity": "warning",
                "message": f"Machine Health - Voltage low: {reading.voltage}V (threshold: 180V)",
            })
        if reading.risk_score and reading.risk_score >= 75:
            alert_rules.append({
                "alert_type": "FAILURE_PREDICTED",
                "severity": "critical",
                "message": f"Machine Health - Failure predicted: risk score {reading.risk_score} (threshold: 75)",
            })

    elif mt == "water_quality":
        if reading.ph is not None:
            if reading.ph < 6.5:
                alert_rules.append({
                    "alert_type": "PH_LOW",
                    "severity": "critical",
                    "message": f"Water Quality - pH low: {reading.ph} (threshold: 6.5)",
                })
            elif reading.ph > 8.5:
                alert_rules.append({
                    "alert_type": "PH_HIGH",
                    "severity": "warning",
                    "message": f"Water Quality - pH high: {reading.ph} (threshold: 8.5)",
                })
        if reading.tds is not None and reading.tds > 500:
            alert_rules.append({
                "alert_type": "TDS_HIGH",
                "severity": "warning",
                "message": f"Water Quality - TDS high: {reading.tds}ppm (threshold: 500ppm)",
            })
        if reading.turbidity is not None and reading.turbidity > 5.0:
            alert_rules.append({
                "alert_type": "CONTAMINATION_RISK",
                "severity": "critical",
                "message": f"Water Quality - Contamination risk: turbidity {reading.turbidity}NTU (threshold: 5NTU)",
            })
        if reading.water_level is not None and reading.water_level < 10:
            alert_rules.append({
                "alert_type": "LOW_WATER_LEVEL",
                "severity": "critical",
                "message": f"Water Quality - Low water level: {reading.water_level}% (threshold: 10%)",
            })
        if reading.flow_rate is not None and (reading.flow_rate < 0.5 or reading.flow_rate > 50):
            alert_rules.append({
                "alert_type": "FLOW_ANOMALY",
                "severity": "warning",
                "message": f"Water Quality - Flow anomaly: {reading.flow_rate}L/min (normal: 0.5-50L/min)",
            })

    elif mt == "warehouse":
        if reading.temperature is not None:
            if reading.temperature > 35:
                alert_rules.append({
                    "alert_type": "TEMPERATURE_HIGH",
                    "severity": "critical",
                    "message": f"Warehouse - Temperature high: {reading.temperature}C (threshold: 35C)",
                })
            elif reading.temperature < 5:
                alert_rules.append({
                    "alert_type": "TEMPERATURE_LOW",
                    "severity": "warning",
                    "message": f"Warehouse - Temperature low: {reading.temperature}C (threshold: 5C)",
                })
        if reading.humidity is not None and reading.humidity > 80:
            alert_rules.append({
                "alert_type": "HUMIDITY_HIGH",
                "severity": "warning",
                "message": f"Warehouse - Humidity high: {reading.humidity}% (threshold: 80%)",
            })
        if reading.motion_detected:
            alert_rules.append({
                "alert_type": "MOTION_DETECTED",
                "severity": "info",
                "message": "Warehouse - Motion detected in zone",
            })
        if reading.air_quality is not None and reading.air_quality < 50:
            alert_rules.append({
                "alert_type": "AIR_QUALITY_BAD",
                "severity": "warning",
                "message": f"Warehouse - Air quality poor: {reading.air_quality}AQI (threshold: 50)",
            })
        if reading.occupancy is not None and reading.occupancy > 50:
            alert_rules.append({
                "alert_type": "OCCUPANCY_CRITICAL",
                "severity": "warning",
                "message": f"Warehouse - High occupancy: {reading.occupancy} (threshold: 50)",
            })

    if reading.risk_score and reading.risk_score >= 80:
        alert_rules.append({
            "alert_type": "HIGH_RISK_SCORE",
            "severity": "critical",
            "message": f"High risk score: {reading.risk_score} (threshold: 80)",
        })
    elif reading.risk_score and reading.risk_score >= 60:
        alert_rules.append({
            "alert_type": "ELEVATED_RISK_SCORE",
            "severity": "warning",
            "message": f"Elevated risk score: {reading.risk_score} (threshold: 60)",
        })

    for rule in alert_rules:
        existing = await db.execute(
            select(Alert).where(
                Alert.device_id == reading.device_id,
                Alert.alert_type == rule["alert_type"],
                Alert.acknowledged == False,
            )
        )
        if not existing.scalar_one_or_none():
            alert = Alert(
                device_id=reading.device_id,
                module_type=mt,
                alert_type=rule["alert_type"],
                severity=rule["severity"],
                message=rule["message"],
                acknowledged=False,
            )
            db.add(alert)

    await db.flush()
