# API Documentation - Industrial IoT Analytics Suite

**Base URL:** `https://your-backend-url.onrender.com`

**Version:** 2.0.0

**OpenAPI Docs:** `/docs` (Swagger UI) | `/redoc` (ReDoc)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all endpoints, user management |
| `operator` | Read/write devices, readings, alerts, reports |
| `viewer` | Read-only access to all endpoints |

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "username": "operator1",
  "email": "operator@example.com",
  "password": "securepass123",
  "role": "operator"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "operator1",
  "email": "operator@example.com",
  "role": "operator",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

**Errors:**
- `409` - Username or email already exists

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Account is disabled

---

### GET /api/auth/me

Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### PUT /api/auth/me

Update current user profile.

**Request:**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

**Response (200 OK):** Updated user object.

---

### GET /api/auth/users

List all users. **Admin only.**

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1
}
```

---

### PUT /api/auth/users/{user_id}/role

Update a user's role. **Admin only.**

**Request:**
```json
{
  "role": "operator"
}
```

**Valid roles:** `admin`, `operator`, `viewer`

---

## Device Management Endpoints

### POST /api/device/register

Register a new device. Devices are also auto-registered when telemetry is received.

**Request:**
```json
{
  "deviceId": "COLD_ROOM_01",
  "zone": "DAIRY",
  "name": "Main Dairy Cold Room",
  "module_type": "cold_storage",
  "group_name": "cold-storage-group-a",
  "firmware_version": "2.0.0",
  "ip_address": "192.168.1.100",
  "mac_address": "AA:BB:CC:DD:EE:FF"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "COLD_ROOM_01",
  "zone": "DAIRY",
  "name": "Main Dairy Cold Room",
  "module_type": "cold_storage",
  "group_name": "cold-storage-group-a",
  "status": "active"
}
```

**Valid module_types:** `cold_storage`, `machine_health`, `water_quality`, `warehouse`

---

### GET /api/devices

List all devices with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module type |
| `status` | string | Filter by status (`active`, `disabled`) |
| `group` | string | Filter by group name |

**Response (200 OK):**
```json
{
  "devices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "COLD_ROOM_01",
      "zone": "DAIRY",
      "name": "Main Dairy Cold Room",
      "module_type": "cold_storage",
      "group_name": "cold-storage-group-a",
      "status": "active",
      "firmware_version": "2.0.0",
      "ip_address": "192.168.1.100",
      "mac_address": "AA:BB:CC:DD:EE:FF",
      "last_heartbeat": "2024-01-15T10:30:00",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

---

### GET /api/device/{device_id}

Get a specific device by its device_id.

**Response (200 OK):** Device object.

**Errors:**
- `404` - Device not found

---

### PUT /api/device/{device_id}

Update device properties.

**Request:**
```json
{
  "name": "Updated Cold Room Name",
  "zone": "PHARMACY",
  "module_type": "cold_storage",
  "group_name": "pharmacy-group"
}
```

**Response (200 OK):** Updated device object.

---

### DELETE /api/device/{device_id}

Delete a device and all associated data.

**Response (200 OK):**
```json
{
  "message": "Device deleted successfully"
}
```

---

### POST /api/device/{device_id}/enable

Enable a disabled device.

**Response (200 OK):**
```json
{
  "message": "Device enabled",
  "device_id": "COLD_ROOM_01",
  "status": "active"
}
```

---

### POST /api/device/{device_id}/disable

Disable a device.

**Response (200 OK):**
```json
{
  "message": "Device disabled",
  "device_id": "COLD_ROOM_01",
  "status": "disabled"
}
```

---

### GET /api/device/{device_id}/health

Get device health metrics.

**Response (200 OK):**
```json
{
  "device_id": "COLD_ROOM_01",
  "status": "active",
  "last_heartbeat": "2024-01-15T10:30:00",
  "uptime_seconds": 86400,
  "total_readings": 8640,
  "avg_risk_score": 18.5,
  "alerts_count": 3,
  "module_type": "cold_storage"
}
```

---

### POST /api/device/discover

Discover active devices that have sent telemetry.

**Response (200 OK):**
```json
{
  "discovered": ["COLD_ROOM_01", "MACHINE_01"],
  "count": 2
}
```

---

### GET /api/device/groups

List all device groups.

**Response (200 OK):**
```json
{
  "groups": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "cold-storage-group-a",
      "description": "Primary cold storage units",
      "module_type": "cold_storage",
      "device_count": 3,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1
}
```

---

### POST /api/device/groups

Create a new device group.

**Request:**
```json
{
  "name": "production-line-1",
  "description": "Machines on production line 1",
  "module_type": "machine_health"
}
```

**Response (201 Created):** Group object.

---

## Sensor Readings Endpoints

### POST /api/readings

Submit telemetry data. This is the primary endpoint used by ESP32 devices. The device is auto-registered if it doesn't exist.

**Request (Cold Storage):**
```json
{
  "module_type": "cold_storage",
  "data": {
    "deviceId": "COLD_ROOM_01",
    "zone": "DAIRY",
    "temperature": 5.4,
    "humidity": 64.2,
    "doorOpen": false,
    "doorOpenSeconds": 0,
    "gasLevel": 1850,
    "compressorCurrent": 3.2,
    "compressorOn": true,
    "powerAvailable": true,
    "riskScore": 18,
    "status": "SAFE"
  }
}
```

**Request (Machine Health):**
```json
{
  "module_type": "machine_health",
  "data": {
    "deviceId": "MACHINE_01",
    "zone": "PRODUCTION",
    "vibration": 1500,
    "temperature": 45.2,
    "current": 5.5,
    "voltage": 220.0,
    "rpm": 1450,
    "riskScore": 25,
    "status": "SAFE"
  }
}
```

**Request (Water Quality):**
```json
{
  "module_type": "water_quality",
  "data": {
    "deviceId": "WATER_01",
    "zone": "TREATMENT",
    "ph": 7.2,
    "tds": 350.0,
    "turbidity": 2.5,
    "chlorine": 0.8,
    "flowRate": 5.5,
    "waterLevel": 85.0,
    "riskScore": 10,
    "status": "SAFE"
  }
}
```

**Request (Warehouse):**
```json
{
  "module_type": "warehouse",
  "data": {
    "deviceId": "WAREHOUSE_01",
    "zone": "STORAGE_A",
    "temperature": 22.5,
    "humidity": 55.0,
    "motionDetected": true,
    "airQuality": 850.0,
    "occupancy": 5,
    "lux": 450.0,
    "riskScore": 12,
    "status": "SAFE"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "COLD_ROOM_01",
  "module_type": "cold_storage",
  "risk_score": 18,
  "status": "SAFE",
  "created_at": "2024-01-15T10:30:00"
}
```

---

### POST /api/readings/cold-storage

Submit cold storage specific reading.

**Request:**
```json
{
  "deviceId": "COLD_ROOM_01",
  "zone": "DAIRY",
  "temperature": 5.4,
  "humidity": 64.2,
  "doorOpen": false,
  "doorOpenSeconds": 0,
  "gasLevel": 1850,
  "compressorCurrent": 3.2,
  "compressorOn": true,
  "powerAvailable": true,
  "riskScore": 18,
  "status": "SAFE"
}
```

---

### POST /api/readings/machine-health

Submit machine health reading.

**Request:**
```json
{
  "deviceId": "MACHINE_01",
  "zone": "PRODUCTION",
  "vibration": 1500,
  "temperature": 45.2,
  "current": 5.5,
  "voltage": 220.0,
  "rpm": 1450,
  "riskScore": 25,
  "status": "SAFE"
}
```

---

### POST /api/readings/water-quality

Submit water quality reading.

**Request:**
```json
{
  "deviceId": "WATER_01",
  "zone": "TREATMENT",
  "ph": 7.2,
  "tds": 350.0,
  "turbidity": 2.5,
  "chlorine": 0.8,
  "flowRate": 5.5,
  "waterLevel": 85.0,
  "riskScore": 10,
  "status": "SAFE"
}
```

---

### POST /api/readings/warehouse

Submit warehouse reading.

**Request:**
```json
{
  "deviceId": "WAREHOUSE_01",
  "zone": "STORAGE_A",
  "temperature": 22.5,
  "humidity": 55.0,
  "motionDetected": true,
  "airQuality": 850.0,
  "occupancy": 5,
  "lux": 450.0,
  "riskScore": 12,
  "status": "SAFE"
}
```

---

### GET /api/readings

Query sensor readings with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `device_id` | string | - | Filter by device |
| `module_type` | string | - | Filter by module |
| `start_date` | string | - | ISO 8601 start date |
| `end_date` | string | - | ISO 8601 end date |
| `limit` | int | 100 | Max results (1-1000) |
| `offset` | int | 0 | Pagination offset |

**Example:**
```bash
curl "http://localhost:8000/api/readings?device_id=COLD_ROOM_01&limit=50"
```

**Response (200 OK):**
```json
{
  "readings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "temperature": 5.4,
      "humidity": 64.2,
      "door_open": false,
      "door_open_seconds": 0,
      "power_available": true,
      "gas_level": 1850,
      "compressor_current": 3.2,
      "compressor_on": true,
      "risk_score": 18,
      "status": "SAFE",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

---

### GET /api/readings/latest

Get the most recent reading for each device.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module type |

**Response (200 OK):**
```json
{
  "readings": [
    {
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "temperature": 5.4,
      "humidity": 64.2,
      "risk_score": 18,
      "status": "SAFE",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

---

### GET /api/readings/{device_id}

Get readings for a specific device.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 100 | Max results |
| `offset` | int | 0 | Pagination offset |

---

### GET /api/readings/stats/summary

Get aggregated statistics for readings.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |
| `device_id` | string | Filter by device |

**Response (200 OK):**
```json
{
  "stats": {
    "total_readings": 1000,
    "module_type": "cold_storage",
    "device_id": "all",
    "temperature": {
      "avg": 5.2,
      "min": 2.1,
      "max": 8.5
    },
    "humidity": {
      "avg": 62.5,
      "min": 45.0,
      "max": 75.0
    },
    "risk_score": {
      "avg": 15.3,
      "min": 0,
      "max": 85
    }
  }
}
```

---

## Analytics Endpoints

### GET /api/analytics

Get overall analytics summary across all modules.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |

**Response (200 OK):**
```json
{
  "summary": {
    "total_devices": 10,
    "active_devices": 8,
    "total_readings": 50000,
    "active_alerts": 5,
    "avg_temperature": 22.5,
    "avg_humidity": 55.0,
    "avg_risk_score": 18.5
  },
  "module_counts": {
    "cold_storage": 3,
    "machine_health": 3,
    "water_quality": 2,
    "warehouse": 2
  },
  "zones": {
    "DAIRY": 2,
    "PRODUCTION": 3,
    "TREATMENT": 2,
    "STORAGE_A": 3
  }
}
```

---

### GET /api/analytics/{device_id}

Get detailed analytics for a specific device.

**Response (200 OK):**
```json
{
  "device_id": "COLD_ROOM_01",
  "today_stats": {
    "avg_temperature": 5.2,
    "min_temperature": 3.1,
    "max_temperature": 7.8,
    "avg_humidity": 62.5,
    "door_open_events": 3,
    "total_door_open_seconds": 45,
    "avg_risk_score": 18.5
  },
  "energy": {
    "compressor_runtime_hours": 18.5,
    "power_failure_events": 0,
    "estimated_kwh": 45.2
  },
  "latest_reading": {
    "temperature": 5.4,
    "humidity": 64.2,
    "door_open": false,
    "risk_score": 18,
    "status": "SAFE"
  }
}
```

---

### GET /api/analytics/{device_id}/trend

Get risk score trend over time.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | int | 7 | Number of days (1-90) |

**Response (200 OK):**
```json
{
  "device_id": "COLD_ROOM_01",
  "days": 7,
  "trend": [
    {
      "date": "2024-01-15",
      "avg_risk": 18.5,
      "max_risk": 45,
      "min_risk": 5,
      "reading_count": 864
    },
    {
      "date": "2024-01-14",
      "avg_risk": 22.1,
      "max_risk": 52,
      "min_risk": 8,
      "reading_count": 864
    }
  ]
}
```

---

### GET /api/analytics/{device_id}/predict

Get predictive analytics for a device.

**Response (200 OK):**
```json
{
  "device_id": "COLD_ROOM_01",
  "predictions": {
    "failure_probability": 0.12,
    "predicted_risk_24h": 22.5,
    "anomaly_detected": false,
    "recommendations": [
      "Schedule compressor maintenance within 30 days",
      "Monitor door open frequency - slight increase detected"
    ],
    "model_confidence": 0.87
  }
}
```

---

### GET /api/analytics/zones/compare

Compare analytics across zones.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |

**Response (200 OK):**
```json
{
  "zones": [
    {
      "zone": "DAIRY",
      "device_count": 2,
      "avg_risk_score": 18.5,
      "avg_temperature": 5.2,
      "total_alerts": 3,
      "reading_count": 5000
    },
    {
      "zone": "PHARMACY",
      "device_count": 1,
      "avg_risk_score": 12.0,
      "avg_temperature": 4.8,
      "total_alerts": 1,
      "reading_count": 2500
    }
  ],
  "count": 2
}
```

---

### GET /api/analytics/modules/compare

Compare analytics across all modules.

**Response (200 OK):**
```json
{
  "modules": [
    {
      "module_type": "cold_storage",
      "device_count": 3,
      "avg_risk_score": 18.5,
      "total_alerts": 5,
      "total_readings": 15000
    },
    {
      "module_type": "machine_health",
      "device_count": 3,
      "avg_risk_score": 75.2,
      "total_alerts": 8,
      "total_readings": 15000
    }
  ],
  "count": 4
}
```

---

### GET /api/analytics/dashboard

Get dashboard-specific analytics summary.

---

## Alert Endpoints

### GET /api/alerts

List alerts with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `device_id` | string | Filter by device |
| `module_type` | string | Filter by module |
| `severity` | string | `info`, `warning`, `critical` |
| `status` | string | `active` or `acknowledged` |
| `limit` | int | Max results (1-500, default 100) |

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "alert_type": "HIGH_TEMPERATURE",
      "severity": "warning",
      "message": "Temperature 9.2C exceeds maximum threshold of 8.0C",
      "acknowledged": false,
      "created_at": "2024-01-15T10:30:00",
      "acknowledged_at": null
    }
  ],
  "count": 1
}
```

---

### GET /api/alerts/active

Get all unacknowledged alerts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |

---

### PUT /api/alerts/{alert_id}/acknowledge

Acknowledge an alert.

**Response (200 OK):**
```json
{
  "message": "Alert acknowledged",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### DELETE /api/alerts/{alert_id}

Delete an alert.

**Response (200 OK):**
```json
{
  "message": "Alert deleted"
}
```

---

### POST /api/alerts/rules

Create a custom alert rule.

**Request:**
```json
{
  "name": "High Temperature Alert",
  "module_type": "cold_storage",
  "alert_type": "TEMPERATURE_HIGH",
  "severity": "critical",
  "threshold_field": "temperature",
  "threshold_operator": ">",
  "threshold_value": 10.0
}
```

**Valid operators:** `>`, `<`, `>=`, `<=`, `==`, `!=`

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "High Temperature Alert",
  "module_type": "cold_storage",
  "alert_type": "TEMPERATURE_HIGH",
  "severity": "critical",
  "threshold_field": "temperature",
  "threshold_operator": ">",
  "threshold_value": 10.0,
  "enabled": true
}
```

---

### GET /api/alerts/rules

List all alert rules.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |

---

## Report Endpoints

### GET /api/reports

List generated reports.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `device_id` | string | Filter by device |
| `report_type` | string | `daily`, `weekly`, `monthly`, `compliance`, `maintenance`, `audit` |
| `module_type` | string | Filter by module |
| `limit` | int | Max results (default 50) |

**Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "report_type": "daily",
      "created_at": "2024-01-15T23:59:00"
    }
  ],
  "count": 1
}
```

---

### POST /api/reports/generate

Generate a new report.

**Request:**
```json
{
  "device_id": "COLD_ROOM_01",
  "report_type": "daily",
  "module_type": "cold_storage",
  "date": "2024-01-15"
}
```

**Report Types:**
| Type | Description | Required Fields |
|------|-------------|-----------------|
| `daily` | Single day summary | `device_id`, `date` |
| `weekly` | Week summary | `device_id`, `date` (any day in week) |
| `monthly` | Monthly summary | `device_id`, `month`, `year` |
| `compliance` | Regulatory compliance | `device_id`, `start_date`, `end_date` |
| `maintenance` | Maintenance report | `device_id`, `start_date`, `end_date` |
| `audit` | Audit trail | `device_id`, `start_date`, `end_date` |

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "device_id": "COLD_ROOM_01",
  "module_type": "cold_storage",
  "report_type": "daily",
  "created_at": "2024-01-15T23:59:00",
  "message": "Report generated successfully"
}
```

---

### GET /api/reports/{report_id}

Get report details.

---

### GET /api/reports/{report_id}/download

Download report as Excel file.

**Response:** `.xlsx` file download

---

## Export Endpoints

### GET /api/export/excel

Export data as Excel file.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `sensors`, `alerts`, `analytics`, `reports`, `devices` |
| `module_type` | string | No | Filter by module |
| `device_id` | string | No | Filter by device |
| `start_date` | string | No | ISO 8601 start date |
| `end_date` | string | No | ISO 8601 end date |
| `severity` | string | No | Filter alerts by severity |
| `report_type` | string | No | Filter reports by type |

**Examples:**
```bash
# Export sensor data
curl -o sensors.xlsx "http://localhost:8000/api/export/excel?type=sensors&device_id=COLD_ROOM_01"

# Export alerts
curl -o alerts.xlsx "http://localhost:8000/api/export/excel?type=alerts&severity=critical"

# Export analytics
curl -o analytics.xlsx "http://localhost:8000/api/export/excel?type=analytics&module_type=cold_storage"
```

**Response:** `.xlsx` file download with Content-Disposition header.

---

## Dashboard Endpoints

### GET /api/dashboard/summary

Get dashboard summary with all key metrics.

**Response (200 OK):**
```json
{
  "total_devices": 10,
  "active_devices": 8,
  "disabled_devices": 2,
  "total_readings": 50000,
  "readings_by_module": {
    "cold_storage": 15000,
    "machine_health": 15000,
    "water_quality": 10000,
    "warehouse": 10000
  },
  "active_alerts": 5,
  "critical_alerts": 2,
  "alerts_by_module": {
    "cold_storage": 2,
    "machine_health": 3,
    "water_quality": 0,
    "warehouse": 0
  },
  "devices_by_module": {
    "cold_storage": 3,
    "machine_health": 3,
    "water_quality": 2,
    "warehouse": 2
  },
  "devices_by_zone": {
    "DAIRY": 2,
    "PRODUCTION": 3,
    "TREATMENT": 2,
    "STORAGE_A": 3
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### GET /api/dashboard/realtime

Get latest readings for all active devices.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module_type` | string | Filter by module |

**Response (200 OK):**
```json
{
  "readings": [
    {
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "zone": "DAIRY",
      "name": "Main Dairy Cold Room",
      "risk_score": 18,
      "status": "SAFE",
      "temperature": 5.4,
      "humidity": 64.2,
      "door_open": false,
      "gas_level": 1850,
      "compressor_on": true,
      "power_available": true,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

---

### GET /api/dashboard/alerts

Get recent critical alerts for dashboard display.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 20 | Max alerts (1-100) |
| `module_type` | string | - | Filter by module |

---

### GET /api/dashboard/charts

Get chart data for the dashboard.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `module_type` | string | - | Filter by module |
| `hours` | int | 24 | Time window (1-168 hours) |

**Response (200 OK):**
```json
{
  "timeline": [
    {
      "timestamp": "2024-01-15T10:00:00",
      "device_id": "COLD_ROOM_01",
      "module_type": "cold_storage",
      "risk_score": 18,
      "temperature": 5.4,
      "humidity": 64.2
    }
  ],
  "alert_counts_by_hour": {
    "2024-01-15 10:00": 2,
    "2024-01-15 11:00": 1
  },
  "total_readings": 500,
  "total_alerts": 5
}
```

---

## Maintenance Endpoints

### GET /api/maintenance/schedules

List maintenance schedules.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `device_id` | string | Filter by device |
| `status` | string | `pending`, `completed`, `overdue` |

**Response (200 OK):**
```json
{
  "schedules": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "device_id": "COLD_ROOM_01",
      "task_name": "Compressor Maintenance",
      "task_type": "preventive",
      "interval_days": 30,
      "last_performed": "2024-01-01T00:00:00",
      "next_due": "2024-01-31T00:00:00",
      "status": "pending",
      "notes": "Check refrigerant levels and compressor belt",
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "count": 1
}
```

---

### POST /api/maintenance/schedules

Create a maintenance schedule.

**Request:**
```json
{
  "device_id": "COLD_ROOM_01",
  "task_name": "Filter Replacement",
  "task_type": "preventive",
  "interval_days": 90,
  "notes": "Replace air filter and clean coils"
}
```

**Response (201 Created):** Schedule object.

---

### PUT /api/maintenance/schedules/{schedule_id}

Update a maintenance schedule.

**Request:**
```json
{
  "task_name": "Updated Filter Replacement",
  "interval_days": 60,
  "status": "completed",
  "notes": "Completed - replaced filter and cleaned coils"
}
```

---

### POST /api/maintenance/{device_id}/trigger

Mark maintenance tasks as completed and schedule next occurrence.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `task_name` | string | Specific task to trigger (optional) |

**Response (200 OK):**
```json
{
  "device_id": "COLD_ROOM_01",
  "completed_count": 2,
  "updated_schedules": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "task_name": "Compressor Maintenance",
      "next_due": "2024-02-15T10:30:00"
    }
  ],
  "message": "Maintenance triggered for 2 tasks"
}
```

---

## WebSocket API

### Connection

```
ws://your-backend-url.onrender.com/ws
```

### Protocol

The WebSocket accepts JSON text messages and echoes them back with a timestamp.

**Send:**
```json
{
  "type": "subscribe",
  "channel": "readings",
  "device_id": "COLD_ROOM_01"
}
```

**Receive:**
```json
{
  "echo": "{\"type\":\"subscribe\",\"channel\":\"readings\",\"device_id\":\"COLD_ROOM_01\"}",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Broadcast Events

The server broadcasts the following events to all connected clients:

**New Reading:**
```json
{
  "event": "new_reading",
  "device_id": "COLD_ROOM_01",
  "module_type": "cold_storage",
  "risk_score": 18,
  "status": "SAFE",
  "timestamp": "2024-01-15T10:30:00"
}
```

**New Alert:**
```json
{
  "event": "new_alert",
  "device_id": "COLD_ROOM_01",
  "alert_type": "HIGH_TEMPERATURE",
  "severity": "warning",
  "message": "Temperature exceeded threshold",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad request - invalid parameters |
| `401` | Unauthorized - missing or invalid token |
| `403` | Forbidden - insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict - resource already exists |
| `429` | Too many requests - rate limited (120 req/min) |
| `500` | Internal server error |

### Rate Limiting

The API enforces a rate limit of **120 requests per minute** per client. When exceeded:

```json
{
  "detail": "Rate limit exceeded. Maximum 120 requests per minute."
}
```

Response header includes:
```
Retry-After: 60
```

---

## CORS Configuration

The API accepts requests from origins specified in the `CORS_ORIGINS` environment variable. Default:

```
http://localhost:5173,https://your-vercel-app.vercel.app
```
