import os
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from .database import Base
import enum


class DeviceType(str, enum.Enum):
    COLD_STORAGE = "cold_storage"
    MACHINE_WATER = "machine_water"
    WAREHOUSE = "warehouse"


class DeviceStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class AlertType(str, enum.Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    POWER = "power"
    GAS = "gas"
    MACHINE = "machine"
    WATER_QUALITY = "water_quality"
    RISK = "risk"


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    device_type = Column(SAEnum(DeviceType), nullable=False)
    location = Column(String(255), default="")
    status = Column(SAEnum(DeviceStatus), default=DeviceStatus.OFFLINE)
    firmware_version = Column(String(50), default="1.0.0")
    ip_address = Column(String(45), default="")
    mac_address = Column(String(17), default="")
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    telemetry = relationship("TelemetryReading", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")
    config = relationship("DeviceConfig", back_populates="device", uselist=False, cascade="all, delete-orphan")


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    power_status = Column(Boolean, default=True)
    gas_level = Column(Float, nullable=True)
    water_ph = Column(Float, nullable=True)
    water_turbidity = Column(Float, nullable=True)
    water_tds = Column(Float, nullable=True)
    vibration_level = Column(Float, nullable=True)
    machine_health_score = Column(Float, nullable=True)
    water_quality_score = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    device = relationship("Device", back_populates="telemetry")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    alert_type = Column(SAEnum(AlertType), nullable=False)
    severity = Column(SAEnum(AlertSeverity), nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    device = relationship("Device", back_populates="alerts")


class DeviceConfig(Base):
    __tablename__ = "device_configs"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), unique=True, nullable=False)
    temp_min = Column(Float, default=0.0)
    temp_max = Column(Float, default=50.0)
    humidity_min = Column(Float, default=0.0)
    humidity_max = Column(Float, default=100.0)
    alert_enabled = Column(Boolean, default=True)
    reporting_interval = Column(Integer, default=30)

    device = relationship("Device", back_populates="config")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    role = Column(String(50), default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
