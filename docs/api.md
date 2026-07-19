# API Documentation

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8000` |
| Production | `https://cold-storage-api.onrender.com` |

## Authentication

All endpoints except `/health`, `/api/readings` (POST), and `/api/auth/login` require a JWT token.

```
Authorization: Bearer <token>
```

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "operator1",
  "email": "operator@example.com",
  "password": "securepass",
  "role": "operator"
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

## Devices

### Register Device (auto-created on first reading)

```
POST /api/device/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_id": "COLD_ROOM_01",
  "zone": "DAIRY",
  "name": "Dairy Cold Room 1",
  "description": "Main dairy storage unit"
}
```

### List All Devices

```
GET /api/devices
GET /api/devices?zone=DAIRY
GET /api/devices?status=active

Response:
[
  {
    "id": "uuid",
    "device_id": "COLD_ROOM_01",
    "zone": "DAIRY",
    "name": "Dairy Cold Room 1",
    "status": "active",
    "last_heartbeat": "2026-07-19T16:30:00Z",
    "created_at": "2026-07-19T12:00:00Z"
  }
]
```

### Get Device Details

```
GET /api/devices/{device_id}

Response:
{
  "id": "uuid",
  "device_id": "COLD_ROOM_01",
  "zone": "DAIRY",
  "name": "Dairy Cold Room 1",
  "status": "active",
  "last_heartbeat": "2026-07-19T16:30:00Z"
}
```

### Update Device

```
PUT /api/devices/{device_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "zone": "MEDICINE",
  "description": "Updated description"
}
```

### Delete Device

```
DELETE /api/devices/{device_id}
```

### Enable/Disable Device

```
POST /api/devices/{device_id}/enable
POST /api/devices/{device_id}/disable
```

### Device Health

```
GET /api/devices/{device_id}/health

Response:
{
  "device_id": "COLD_ROOM_01",
  "status": "online",
  "last_heartbeat": "2026-07-19T16:30:00Z",
  "uptime_hours": 24.5,
  "total_readings": 8640
}
```

---

## Sensor Readings

### Post Telemetry (ESP32 endpoint - NO AUTH required)

```
POST /api/readings
Content-Type: application/json

{
  "deviceId": "COLD_ROOM_01",
  "zone": "DAIRY",
  "temperature": 5.4,
  "humidity": 64.2,
  "doorOpen": false,
  "doorOpenSeconds": 0,
  "powerAvailable": true,
  "gasLevel": 1850,
  "compressorCurrent": 3.2,
  "compressorOn": true,
  "riskScore": 18,
  "status": "SAFE"
}

Response:
{
  "id": "uuid",
  "device_id": "COLD_ROOM_01",
  "created_at": "2026-07-19T16:30:00Z",
  "alerts_triggered": []
}
```

### Get Readings

```
GET /api/readings
GET /api/readings?device_id=COLD_ROOM_01
GET /api/readings?zone=DAIRY
GET /api/readings?start_date=2026-07-01&end_date=2026-07-19
GET /api/readings?limit=100
```

### Get Latest Readings

```
GET /api/readings/latest

Response:
[
  {
    "device_id": "COLD_ROOM_01",
    "temperature": 5.4,
    "humidity": 64.2,
    "status": "SAFE",
    "riskScore": 18,
    "created_at": "2026-07-19T16:30:00Z"
  }
]
```

---

## Analytics

### Get Analytics

```
GET /api/analytics
GET /api/analytics?device_id=COLD_ROOM_01
GET /api/analytics?period_type=hourly
GET /api/analytics?start_date=2026-07-01&end_date=2026-07-19
```

### Dashboard Summary

```
GET /api/analytics/summary

Response:
{
  "total_devices": 4,
  "online_devices": 3,
  "offline_devices": 1,
  "avg_temperature": 5.2,
  "avg_humidity": 62.5,
  "active_alerts": 3,
  "avg_risk_score": 22,
  "total_readings_today": 2880
}
```

### Zone Comparison

```
GET /api/analytics/zones

Response:
{
  "DAIRY": {
    "avg_temperature": 5.2,
    "avg_humidity": 62.5,
    "avg_risk_score": 18,
    "device_count": 1
  },
  "MEDICINE": {
    "avg_temperature": 4.1,
    "avg_humidity": 55.3,
    "avg_risk_score": 12,
    "device_count": 1
  },
  "VEGETABLE": {
    "avg_temperature": 6.8,
    "avg_humidity": 68.1,
    "avg_risk_score": 25,
    "device_count": 1
  }
}
```

### ML Predictions

```
GET /api/analytics/predictions/{device_id}

Response:
{
  "spoilage_risk": 0.15,
  "compressor_failure_probability": 0.02,
  "abnormal_temperature_events": 0,
  "predicted_temperature_next_hour": 5.6,
  "predicted_humidity_next_hour": 63.8,
  "model_confidence": 0.85
}
```

---

## Alerts

### Get Alerts

```
GET /api/alerts
GET /api/alerts?device_id=COLD_ROOM_01
GET /api/alerts?level=critical
GET /api/alerts?alert_type=temperature_high
GET /api/alerts?resolved=false
```

### Get Active Alerts

```
GET /api/alerts/active

Response:
[
  {
    "id": "uuid",
    "device_id": "COLD_ROOM_01",
    "zone": "DAIRY",
    "alert_type": "temperature_high",
    "level": "warning",
    "message": "Temperature exceeded 8°C: current 9.2°C",
    "resolved": false,
    "created_at": "2026-07-19T16:30:00Z"
  }
]
```

### Resolve Alert

```
POST /api/alerts/{alert_id}/resolve
```

### Alert Statistics

```
GET /api/alerts/stats

Response:
{
  "total": 156,
  "by_level": {
    "info": 45,
    "warning": 78,
    "critical": 33
  },
  "by_type": {
    "temperature_high": 40,
    "temperature_low": 15,
    "humidity_deviation": 30,
    "door_left_open": 25,
    "gas_leak": 10,
    "power_failure": 18,
    "compressor_failure": 8,
    "high_risk_score": 10
  }
}
```

---

## Reports

### Generate Report

```
POST /api/reports/generate
Content-Type: application/json

{
  "report_type": "daily",
  "device_id": "COLD_ROOM_01",
  "zone": "DAIRY",
  "start_date": "2026-07-19",
  "end_date": "2026-07-19"
}

Response:
{
  "id": "uuid",
  "report_type": "daily",
  "title": "Daily Report - COLD_ROOM_01 - 2026-07-19",
  "content": { ... },
  "created_at": "2026-07-19T17:00:00Z"
}
```

Report types: `daily`, `weekly`, `monthly`, `compliance`, `risk`, `maintenance`

---

## Excel Export

### Export Sensor Data

```
GET /api/export/excel
GET /api/export/excel?device_id=COLD_ROOM_01
GET /api/export/excel?zone=DAIRY
GET /api/export/excel?start_date=2026-07-01&end_date=2026-07-19

Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
```

### Export Alerts

```
GET /api/export/alerts
```

### Export Analytics

```
GET /api/export/analytics
```

---

## Health Check

```
GET /health

Response:
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "uptime": 3600
}
```

---

## Error Responses

```json
{
  "detail": "Error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

Default: 100 requests per minute per IP address.

Exceeding the limit returns HTTP 429 with a `Retry-After` header.
