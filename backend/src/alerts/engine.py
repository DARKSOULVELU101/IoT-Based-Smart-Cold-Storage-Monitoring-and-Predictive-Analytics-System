from typing import List
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import Alert, AlertLevel, SensorReading, Device

TEMPERATURE_HIGH = 8.0
TEMPERATURE_LOW = 2.0
HUMIDITY_HIGH = 70.0
DOOR_OPEN_SECONDS = 15
GAS_LEAK = 2600
COMPRESSOR_CURRENT_HIGH = 8.0
RISK_SCORE_HIGH = 60


class AlertEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate(self, device: Device, reading: SensorReading) -> List[Alert]:
        alerts = []

        checks = [
            ("TEMPERATURE_HIGH", reading.temperature > TEMPERATURE_HIGH, AlertLevel.WARNING,
             f"Temperature {reading.temperature}°C exceeds {TEMPERATURE_HIGH}°C"),
            ("TEMPERATURE_LOW", reading.temperature < TEMPERATURE_LOW, AlertLevel.WARNING,
             f"Temperature {reading.temperature}°C below {TEMPERATURE_LOW}°C"),
            ("HUMIDITY_HIGH", reading.humidity > HUMIDITY_HIGH, AlertLevel.WARNING,
             f"Humidity {reading.humidity}% exceeds {HUMIDITY_HIGH}%"),
            ("DOOR_LEFT_OPEN", reading.door_open and reading.door_open_seconds > DOOR_OPEN_SECONDS, AlertLevel.WARNING,
             f"Door open for {reading.door_open_seconds}s"),
            ("GAS_LEAK", reading.gas_level > GAS_LEAK, AlertLevel.CRITICAL,
             f"Gas level {reading.gas_level}ppm exceeds {GAS_LEAK}ppm"),
            ("POWER_FAILURE", not reading.power_available, AlertLevel.CRITICAL,
             "Power failure detected"),
            ("COMPRESSOR_FAILURE", reading.compressor_current > COMPRESSOR_CURRENT_HIGH, AlertLevel.CRITICAL,
             f"Compressor current {reading.compressor_current}A exceeds {COMPRESSOR_CURRENT_HIGH}A"),
            ("HIGH_RISK_SCORE", reading.risk_score > RISK_SCORE_HIGH, AlertLevel.CRITICAL,
             f"Risk score {reading.risk_score} exceeds {RISK_SCORE_HIGH}"),
        ]

        for alert_type, condition, level, message in checks:
            if condition:
                existing = await self.db.execute(
                    select(Alert).where(
                        Alert.device_id == device.id,
                        Alert.alert_type == alert_type,
                        Alert.resolved == False,
                    ).limit(1)
                )
                if not existing.scalar_one_or_none():
                    alert = Alert(
                        device_id=device.id,
                        zone=reading.zone,
                        alert_type=alert_type,
                        level=level,
                        message=message,
                        resolved=False,
                        created_at=datetime.utcnow(),
                    )
                    self.db.add(alert)
                    alerts.append(alert)

        if alerts:
            await self.db.commit()
            for alert in alerts:
                await self.db.refresh(alert)

        return alerts


async def run_alert_engine(db: AsyncSession, device: Device, reading: SensorReading) -> List[Alert]:
    engine = AlertEngine(db)
    return await engine.evaluate(device, reading)
