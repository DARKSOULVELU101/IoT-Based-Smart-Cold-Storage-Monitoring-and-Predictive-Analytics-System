from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID


# ── Device Schemas ──

class DeviceCreate(BaseModel):
    device_id: str
    zone: str
    name: Optional[str] = None
    description: Optional[str] = None


class DeviceUpdate(BaseModel):
    zone: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class DeviceResponse(BaseModel):
    id: UUID
    device_id: str
    zone: str
    name: Optional[str] = None
    description: Optional[str] = None
    status: str
    last_heartbeat: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeviceListResponse(BaseModel):
    devices: List[DeviceResponse]
    total: int


# ── Reading Schemas ──

class ReadingCreate(BaseModel):
    deviceId: str
    zone: str
    temperature: float
    humidity: float
    doorOpen: bool = False
    doorOpenSeconds: int = 0
    powerAvailable: bool = True
    gasLevel: int = 0
    compressorCurrent: float = 0.0
    compressorOn: bool = False
    riskScore: int = 0
    status: str = "SAFE"


class ReadingResponse(BaseModel):
    id: UUID
    device_id: UUID
    zone: str
    temperature: float
    humidity: float
    door_open: bool
    door_open_seconds: int
    power_available: bool
    gas_level: int
    compressor_current: float
    compressor_on: bool
    risk_score: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReadingListResponse(BaseModel):
    readings: List[ReadingResponse]
    total: int


# ── Alert Schemas ──

class AlertCreate(BaseModel):
    device_id: UUID
    zone: str
    alert_type: str
    level: str
    message: str


class AlertResponse(BaseModel):
    id: UUID
    device_id: UUID
    zone: str
    alert_type: str
    level: str
    message: str
    resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int


class AlertResolve(BaseModel):
    resolved: bool = True


# ── Analytics Schemas ──

class AnalyticsResponse(BaseModel):
    id: UUID
    device_id: UUID
    zone: str
    period_type: str
    temperature_avg: Optional[float] = None
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None
    humidity_avg: Optional[float] = None
    door_open_count: int = 0
    door_open_duration: float = 0.0
    compressor_runtime: float = 0.0
    power_failure_count: int = 0
    risk_score_avg: float = 0.0
    energy_consumption: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsListResponse(BaseModel):
    analytics: List[AnalyticsResponse]
    total: int


# ── Report Schemas ──

class ReportGenerate(BaseModel):
    device_id: Optional[UUID] = None
    zone: Optional[str] = None
    report_type: str = "daily"


class ReportResponse(BaseModel):
    id: UUID
    device_id: Optional[UUID] = None
    zone: Optional[str] = None
    report_type: str
    title: str
    content: Optional[dict] = None
    file_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    reports: List[ReportResponse]
    total: int


# ── Auth Schemas ──

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str
    password: str = Field(..., min_length=6)
    role: str = "viewer"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None


# ── Dashboard Schemas ──

class DashboardSummary(BaseModel):
    total_devices: int
    online_devices: int
    avg_temperature: float
    avg_humidity: float
    total_alerts: int
    critical_alerts: int
    avg_risk_score: float
    total_readings: int


class ZoneComparison(BaseModel):
    zone: str
    device_count: int
    avg_temperature: float
    avg_humidity: float
    avg_risk_score: float
    alert_count: int
    reading_count: int


class ExportRequest(BaseModel):
    device_id: Optional[str] = None
    zone: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
