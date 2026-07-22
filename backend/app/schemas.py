from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class DeviceTypeSchema(str, Enum):
    COLD_STORAGE = "cold_storage"
    MACHINE_WATER = "machine_water"
    WAREHOUSE = "warehouse"


class DeviceStatusSchema(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class AlertTypeSchema(str, Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    POWER = "power"
    GAS = "gas"
    MACHINE = "machine"
    WATER_QUALITY = "water_quality"
    RISK = "risk"


class AlertSeveritySchema(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeviceCreate(BaseModel):
    name: str
    device_type: DeviceTypeSchema
    location: str = ""
    firmware_version: str = "1.0.0"
    ip_address: str = ""
    mac_address: str = ""


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    device_type: Optional[DeviceTypeSchema] = None
    location: Optional[str] = None
    status: Optional[DeviceStatusSchema] = None
    firmware_version: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None


class DeviceRead(BaseModel):
    id: int
    name: str
    device_type: DeviceTypeSchema
    location: str
    status: DeviceStatusSchema
    firmware_version: str
    ip_address: str
    mac_address: str
    last_heartbeat: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TelemetryCreate(BaseModel):
    device_id: int
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    power_status: bool = True
    gas_level: Optional[float] = None
    water_ph: Optional[float] = None
    water_turbidity: Optional[float] = None
    water_tds: Optional[float] = None
    vibration_level: Optional[float] = None
    machine_health_score: Optional[float] = None
    water_quality_score: Optional[float] = None
    risk_score: Optional[float] = None
    raw_data: Optional[dict] = None


class TelemetryRead(BaseModel):
    id: int
    device_id: int
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    power_status: bool
    gas_level: Optional[float] = None
    water_ph: Optional[float] = None
    water_turbidity: Optional[float] = None
    water_tds: Optional[float] = None
    vibration_level: Optional[float] = None
    machine_health_score: Optional[float] = None
    water_quality_score: Optional[float] = None
    risk_score: Optional[float] = None
    raw_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AlertCreate(BaseModel):
    device_id: int
    alert_type: AlertTypeSchema
    severity: AlertSeveritySchema
    message: str


class AlertRead(BaseModel):
    id: int
    device_id: int
    alert_type: AlertTypeSchema
    severity: AlertSeveritySchema
    message: str
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime
    device_name: Optional[str] = None

    class Config:
        from_attributes = True


class DeviceConfigRead(BaseModel):
    id: int
    device_id: int
    temp_min: float
    temp_max: float
    humidity_min: float
    humidity_max: float
    alert_enabled: bool
    reporting_interval: int

    class Config:
        from_attributes = True


class DeviceConfigUpdate(BaseModel):
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    humidity_min: Optional[float] = None
    humidity_max: Optional[float] = None
    alert_enabled: Optional[bool] = None
    reporting_interval: Optional[int] = None


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str = ""


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class DashboardSummary(BaseModel):
    total_devices: int
    online_devices: int
    offline_devices: int
    maintenance_devices: int
    latest_readings: List[TelemetryRead]
    active_alerts: int
    critical_alerts: int
    avg_temperature: Optional[float] = None
    avg_humidity: Optional[float] = None
    avg_machine_health: Optional[float] = None
    avg_water_quality: Optional[float] = None
    avg_risk_score: Optional[float] = None
    recent_alerts: List[AlertRead]
    device_type_counts: dict = {}


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int


class ReportRequest(BaseModel):
    report_type: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    device_id: Optional[int] = None


class AnalyticsResponse(BaseModel):
    labels: List[str]
    datasets: List[dict]
    summary: dict
