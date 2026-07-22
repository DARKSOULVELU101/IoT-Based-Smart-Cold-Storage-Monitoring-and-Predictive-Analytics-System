from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random

from ..models import Device, TelemetryReading, Alert, DeviceConfig, AuditLog, DeviceType, DeviceStatus, AlertType, AlertSeverity


def seed_database(db: Session):
    existing = db.query(Device).count()
    if existing > 0:
        return {"message": "Database already seeded", "devices": existing}

    devices = [
        Device(name="Cold Storage Unit A", device_type=DeviceType.COLD_STORAGE, location="Warehouse 1 - Zone A", status=DeviceStatus.ONLINE, ip_address="192.168.1.101", mac_address="AA:BB:CC:DD:EE:01", battery_level=87, signal_strength=-42, latency_ms=12),
        Device(name="Cold Storage Unit B", device_type=DeviceType.COLD_STORAGE, location="Warehouse 1 - Zone B", status=DeviceStatus.ONLINE, ip_address="192.168.1.102", mac_address="AA:BB:CC:DD:EE:02", battery_level=92, signal_strength=-38, latency_ms=8),
        Device(name="Machine Health Sensor 1", device_type=DeviceType.MACHINE_WATER, location="Factory Floor - Line 1", status=DeviceStatus.ONLINE, ip_address="192.168.1.103", mac_address="AA:BB:CC:DD:EE:03", battery_level=65, signal_strength=-55, latency_ms=45),
        Device(name="Water Quality Monitor A", device_type=DeviceType.MACHINE_WATER, location="Water Treatment Plant", status=DeviceStatus.ONLINE, ip_address="192.168.1.104", mac_address="AA:BB:CC:DD:EE:04", battery_level=78, signal_strength=-48, latency_ms=22),
        Device(name="Warehouse Environment Sensor", device_type=DeviceType.WAREHOUSE, location="Warehouse 2 - Main", status=DeviceStatus.ONLINE, ip_address="192.168.1.105", mac_address="AA:BB:CC:DD:EE:05", battery_level=43, signal_strength=-62, latency_ms=78),
        Device(name="Cold Storage Unit C", device_type=DeviceType.COLD_STORAGE, location="Warehouse 3 - Zone A", status=DeviceStatus.OFFLINE, ip_address="192.168.1.106", mac_address="AA:BB:CC:DD:EE:06", battery_level=12, signal_strength=-85, latency_ms=1200),
        Device(name="Machine Health Sensor 2", device_type=DeviceType.MACHINE_WATER, location="Factory Floor - Line 2", status=DeviceStatus.MAINTENANCE, ip_address="192.168.1.107", mac_address="AA:BB:CC:DD:EE:07", battery_level=28, signal_strength=-72, latency_ms=320),
        Device(name="Water Quality Monitor B", device_type=DeviceType.MACHINE_WATER, location="Water Treatment Plant - B", status=DeviceStatus.ONLINE, ip_address="192.168.1.108", mac_address="AA:BB:CC:DD:EE:08", battery_level=95, signal_strength=-35, latency_ms=5),
    ]

    for d in devices:
        d.last_heartbeat = datetime.now(timezone.utc) - timedelta(minutes=random.randint(0, 30))
        db.add(d)
    db.flush()

    for d in devices:
        config = DeviceConfig(device_id=d.id)
        db.add(config)

    for device in devices:
        for i in range(50):
            hours_ago = random.uniform(0, 168)
            timestamp = datetime.now(timezone.utc) - timedelta(hours=hours_ago)

            temp = random.uniform(2, 8) if device.device_type == DeviceType.COLD_STORAGE else random.uniform(20, 35)
            humidity = random.uniform(30, 80)
            gas = random.uniform(0, 100)
            vibration = random.uniform(0, 10)
            power = random.choice([True, True, True, False])
            health = random.uniform(60, 98)
            wq = random.uniform(60, 100)
            risk = random.uniform(10, 90)
            ph = random.uniform(6.5, 8.5)
            turbidity = random.uniform(0, 15)
            tds = random.uniform(50, 500)

            reading = TelemetryReading(
                device_id=device.id,
                temperature=round(temp, 2),
                humidity=round(humidity, 2),
                power_status=power,
                gas_level=round(gas, 2),
                water_ph=round(ph, 2),
                water_turbidity=round(turbidity, 2),
                water_tds=round(tds, 2),
                vibration_level=round(vibration, 2),
                machine_health_score=round(health, 2),
                water_quality_score=round(wq, 2),
                risk_score=round(risk, 2),
                created_at=timestamp,
            )
            db.add(reading)

    alert_messages = [
        ("temperature", AlertSeverity.HIGH, "Temperature exceeds threshold - Immediate attention required"),
        ("humidity", AlertSeverity.MEDIUM, "Humidity level above normal range"),
        ("power", AlertSeverity.CRITICAL, "Power interruption detected on device"),
        ("gas", AlertSeverity.LOW, "Gas level elevated but within safe range"),
        ("machine", AlertSeverity.HIGH, "Machine health score below 60%"),
        ("water_quality", AlertSeverity.MEDIUM, "Water quality score declining"),
        ("risk", AlertSeverity.CRITICAL, "Risk score above 80 - Critical intervention needed"),
    ]

    for device in devices[:4]:
        atype, severity, msg = random.choice(alert_messages)
        alert = Alert(
            device_id=device.id,
            alert_type=atype,
            severity=severity,
            message=f"[{device.name}] {msg}",
            is_resolved=random.choice([True, False]),
            created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 48)),
        )
        db.add(alert)

    audit_actions = [
        ("system", "device_heartbeat", "device", "Heartbeat received"),
        ("system", "telemetry_ingest", "telemetry", "Telemetry data ingested"),
        ("system", "alert_created", "alert", "Alert triggered by threshold"),
        ("admin", "device_enable", "device", "Device enabled by administrator"),
        ("admin", "device_disable", "device", "Device disabled by administrator"),
        ("admin", "alert_resolve", "alert", "Alert resolved by administrator"),
        ("system", "data_export", "report", "Report exported to CSV"),
        ("admin", "device_config_update", "device_config", "Device configuration updated"),
        ("system", "health_check", "system", "System health check completed"),
        ("admin", "user_login", "auth", "User authenticated successfully"),
        ("system", "anomaly_detected", "telemetry", "Anomaly detected in sensor data"),
        ("system", "failure_prediction", "device", "Failure prediction model updated"),
    ]

    for i, (user, action, entity, details_msg) in enumerate(audit_actions):
        log = AuditLog(
            username=user,
            action=action,
            entity_type=entity,
            entity_id=random.randint(1, 8),
            details={"message": details_msg, "source": "seed_data"},
            ip_address=f"192.168.1.{random.randint(10, 200)}",
            created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 72)),
        )
        db.add(log)

    db.commit()
    return {"message": "Database seeded successfully", "devices": len(devices), "readings_per_device": 50, "audit_logs": len(audit_actions)}
