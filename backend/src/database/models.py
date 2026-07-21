import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Boolean, Integer, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database.connection import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), unique=True, nullable=False, index=True)
    zone = Column(String(50), nullable=False)
    name = Column(String(200), nullable=True)
    module_type = Column(String(50), nullable=False, default="cold_storage")
    group_name = Column(String(100), nullable=True)
    status = Column(String(20), default="active")
    firmware_version = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    mac_address = Column(String(50), nullable=True)
    last_heartbeat = Column(DateTime, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    readings = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="device", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="device", cascade="all, delete-orphan")
    maintenance_schedules = relationship("MaintenanceSchedule", back_populates="device", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, default="cold_storage")
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    door_open = Column(Boolean, default=False)
    door_open_seconds = Column(Integer, default=0)
    power_available = Column(Boolean, default=True)
    gas_level = Column(Integer, default=0)
    compressor_current = Column(Float, default=0.0)
    compressor_on = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)
    status = Column(String(20), default="SAFE")
    vibration = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    voltage = Column(Float, nullable=True)
    rpm = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    tds = Column(Float, nullable=True)
    turbidity = Column(Float, nullable=True)
    chlorine = Column(Float, nullable=True)
    flow_rate = Column(Float, nullable=True)
    water_level = Column(Float, nullable=True)
    motion_detected = Column(Boolean, default=False)
    air_quality = Column(Float, nullable=True)
    occupancy = Column(Integer, nullable=True)
    lux = Column(Float, nullable=True)
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("Device", back_populates="readings")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, default="cold_storage")
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="alerts")


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    module_type = Column(String(50), nullable=False)
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    threshold_field = Column(String(100), nullable=False)
    threshold_operator = Column(String(10), nullable=False)
    threshold_value = Column(Float, nullable=False)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, default="cold_storage")
    date = Column(DateTime, nullable=False)
    avg_temp = Column(Float, nullable=True)
    min_temp = Column(Float, nullable=True)
    max_temp = Column(Float, nullable=True)
    avg_humidity = Column(Float, nullable=True)
    door_open_count = Column(Integer, default=0)
    door_open_duration = Column(Integer, default=0)
    compressor_runtime = Column(Integer, default=0)
    power_failure_count = Column(Integer, default=0)
    avg_risk_score = Column(Float, default=0.0)
    avg_vibration = Column(Float, nullable=True)
    avg_current = Column(Float, nullable=True)
    avg_voltage = Column(Float, nullable=True)
    avg_rpm = Column(Float, nullable=True)
    avg_ph = Column(Float, nullable=True)
    avg_tds = Column(Float, nullable=True)
    avg_turbidity = Column(Float, nullable=True)
    avg_flow_rate = Column(Float, nullable=True)
    avg_water_level = Column(Float, nullable=True)
    motion_event_count = Column(Integer, default=0)
    avg_air_quality = Column(Float, nullable=True)
    avg_occupancy = Column(Float, nullable=True)
    avg_lux = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="analytics")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    module_type = Column(String(50), nullable=False, default="cold_storage")
    report_type = Column(String(50), nullable=False)
    report_data = Column(JSON, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="reports")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(500), nullable=False)
    role = Column(String(20), default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(200), nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DeviceGroup(Base):
    __tablename__ = "device_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    module_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(String(100), ForeignKey("devices.device_id"), nullable=False, index=True)
    task_name = Column(String(200), nullable=False)
    task_type = Column(String(50), nullable=False)
    interval_days = Column(Integer, nullable=False)
    last_performed = Column(DateTime, nullable=True)
    next_due = Column(DateTime, nullable=False)
    status = Column(String(20), default="pending")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    device = relationship("Device", back_populates="maintenance_schedules")
