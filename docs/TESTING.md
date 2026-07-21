# Testing Guide - IoT Analytics Suite

## 1. Backend API Testing

### Prerequisites
- Python 3.11+
- PostgreSQL database (local or Neon)
- Backend running locally

### Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Configure DATABASE_URL
uvicorn main:app --reload       # http://localhost:8000
```

### Test Health Endpoint
```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{"status":"healthy","database":"healthy","version":"2.0.0"}
```

### Test Authentication Flow

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","role":"admin"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Save the `access_token` from the response for subsequent requests:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

**Get Profile:**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Cold Storage Module

**Submit Reading:**
```bash
curl -X POST http://localhost:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Submit Reading via Module-Specific Endpoint:**
```bash
curl -X POST http://localhost:8000/api/readings/cold-storage \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Test Machine Health Module

```bash
curl -X POST http://localhost:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Test Water Quality Module

```bash
curl -X POST http://localhost:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Test Warehouse Module

```bash
curl -X POST http://localhost:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Test Query Endpoints

**Get Latest Readings:**
```bash
curl http://localhost:8000/api/readings/latest
```

**Get Readings with Filters:**
```bash
curl "http://localhost:8000/api/readings?device_id=COLD_ROOM_01&limit=50"
```

**Get Reading Stats:**
```bash
curl "http://localhost:8000/api/readings/stats/summary?module_type=cold_storage"
```

### Test Device Management

**Register Device:**
```bash
curl -X POST http://localhost:8000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"COLD_ROOM_02","zone":"PHARMACY","name":"Pharmacy Cold Room","module_type":"cold_storage"}'
```

**List Devices:**
```bash
curl http://localhost:8000/api/devices
```

**Get Device Health:**
```bash
curl http://localhost:8000/api/device/COLD_ROOM_01/health
```

**Disable Device:**
```bash
curl -X POST http://localhost:8000/api/device/COLD_ROOM_01/disable
```

**Enable Device:**
```bash
curl -X POST http://localhost:8000/api/device/COLD_ROOM_01/enable
```

### Test Alert System

**Trigger Alert (high temperature):**
```bash
curl -X POST http://localhost:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "module_type": "cold_storage",
    "data": {
      "deviceId": "COLD_ROOM_01",
      "zone": "DAIRY",
      "temperature": 15.0,
      "humidity": 85.0,
      "doorOpen": true,
      "doorOpenSeconds": 30,
      "gasLevel": 3000,
      "compressorCurrent": 9.0,
      "compressorOn": true,
      "powerAvailable": false,
      "riskScore": 95,
      "status": "CRITICAL"
    }
  }'
```

**Check Active Alerts:**
```bash
curl http://localhost:8000/api/alerts/active
```

**Acknowledge Alert:**
```bash
curl -X PUT http://localhost:8000/api/alerts/{alert_id}/acknowledge
```

**Create Custom Alert Rule:**
```bash
curl -X POST http://localhost:8000/api/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Extreme Temperature",
    "module_type": "cold_storage",
    "alert_type": "TEMPERATURE_CRITICAL",
    "severity": "critical",
    "threshold_field": "temperature",
    "threshold_operator": ">",
    "threshold_value": 12.0
  }'
```

### Test Analytics

**Overall Summary:**
```bash
curl http://localhost:8000/api/analytics
```

**Device Analytics:**
```bash
curl http://localhost:8000/api/analytics/COLD_ROOM_01
```

**Risk Trend:**
```bash
curl "http://localhost:8000/api/analytics/COLD_ROOM_01/trend?days=7"
```

**Predictions:**
```bash
curl http://localhost:8000/api/analytics/COLD_ROOM_01/predict
```

**Zone Comparison:**
```bash
curl http://localhost:8000/api/analytics/zones/compare
```

**Module Comparison:**
```bash
curl http://localhost:8000/api/analytics/modules/compare
```

### Test Reports

**Generate Daily Report:**
```bash
curl -X POST http://localhost:8000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "COLD_ROOM_01",
    "report_type": "daily",
    "module_type": "cold_storage",
    "date": "2024-01-15"
  }'
```

**List Reports:**
```bash
curl http://localhost:8000/api/reports
```

**Download Report:**
```bash
curl -o report.xlsx http://localhost:8000/api/reports/{report_id}/download
```

### Test Excel Export

```bash
# Export sensor data
curl -o sensors.xlsx "http://localhost:8000/api/export/excel?type=sensors&device_id=COLD_ROOM_01"

# Export alerts
curl -o alerts.xlsx "http://localhost:8000/api/export/excel?type=alerts"

# Export analytics
curl -o analytics.xlsx "http://localhost:8000/api/export/excel?type=analytics&module_type=cold_storage"

# Export devices
curl -o devices.xlsx "http://localhost:8000/api/export/excel?type=devices"
```

### Test Dashboard

```bash
curl http://localhost:8000/api/dashboard/summary
curl http://localhost:8000/api/dashboard/realtime
curl http://localhost:8000/api/dashboard/alerts
curl "http://localhost:8000/api/dashboard/charts?hours=24"
```

### Test Maintenance

**Create Schedule:**
```bash
curl -X POST http://localhost:8000/api/maintenance/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "COLD_ROOM_01",
    "task_name": "Compressor Service",
    "task_type": "preventive",
    "interval_days": 30,
    "notes": "Check refrigerant and belts"
  }'
```

**List Schedules:**
```bash
curl http://localhost:8000/api/maintenance/schedules?device_id=COLD_ROOM_01
```

**Trigger Maintenance:**
```bash
curl -X POST "http://localhost:8000/api/maintenance/COLD_ROOM_01/trigger?task_name=Compressor%20Service"
```

---

## 2. Frontend Testing

### Start Frontend
```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### Manual Verification Checklist

**Dashboard Page:**
- [ ] Stats cards load with device count, alerts, readings
- [ ] Module breakdown chart renders
- [ ] Zone distribution chart renders
- [ ] Recent alerts list populates
- [ ] Real-time data updates (if backend running)

**Devices Page:**
- [ ] Device list loads with all registered devices
- [ ] Device cards show status, zone, module type
- [ ] Enable/disable toggle works
- [ ] Device details modal opens

**Analytics Page:**
- [ ] Zone comparison chart renders
- [ ] Module comparison chart renders
- [ ] Trend charts display data
- [ ] Date range selector works

**Alerts Page:**
- [ ] Alert list loads with severity indicators
- [ ] Filter by module works
- [ ] Acknowledge button functions
- [ ] Alert count badge updates

**Reports Page:**
- [ ] Report type selector renders
- [ ] Generate report button works
- [ ] Report list loads
- [ ] Download button triggers file download

**Export Page:**
- [ ] Export type selector works
- [ ] Download triggers .xlsx file

**UI/UX:**
- [ ] Dark theme applies consistently
- [ ] Sidebar navigation highlights active route
- [ ] Responsive layout works on mobile widths
- [ ] Framer Motion animations are smooth
- [ ] Loading spinners appear during data fetch
- [ ] Error states display correctly
- [ ] Toast notifications appear for actions

---

## 3. Wokwi Simulation Testing

### Test 1: Basic Telemetry (Cold Storage)
1. Deploy backend to Render
2. Update `API_URL` in `hardware/cold-storage/sketch.ino`
3. Open Wokwi and run the simulation
4. Check Serial Monitor for telemetry output
5. Verify HTTP 201 response from backend

**Expected Serial Output:**
```
Connecting to Wokwi WiFi..... connected
Telemetry: {"deviceId":"COLD_ROOM_01","zone":"DAIRY","temperature":24.0,...}
API response: 201
{"id":"...","device_id":"COLD_ROOM_01","risk_score":42,"status":"WARNING"}
```

### Test 2: Auto Device Registration
1. Clear all devices from database
2. Start Wokwi simulation
3. Wait 10-15 seconds
4. Check `GET /api/devices` - device should appear

### Test 3: Alert Generation (Door Open)
1. Start Wokwi simulation
2. Toggle the door switch to OPEN position
3. Wait 15+ seconds
4. Check `GET /api/alerts/active`
5. Should see "Door Left Open" or "HIGH_TEMPERATURE" warning

### Test 4: Critical Alert (Gas Leak)
1. Rotate gas potentiometer above 2600
2. Check Serial Monitor - risk score should increase
3. Check `GET /api/alerts/active` for gas leak alert
4. In Wokwi: Red LED should activate, buzzer should sound

### Test 5: Power Failure
1. Toggle power switch in Wokwi
2. Risk score should increase by 15 points
3. Compressor should turn off
4. Alert should be generated

### Test 6: Machine Health Module
1. Update `API_URL` in `hardware/machine-health/sketch.ino`
2. Start Wokwi simulation with machine health diagram
3. Rotate vibration potentiometer above 3072
4. Health score should drop to CRITICAL
5. Relay should turn off (safety shutdown)

### Test 7: Water Quality Module
1. Update `API_URL` in `hardware/water-quality/sketch.ino`
2. Start Wokwi simulation
3. Rotate pH potentiometer to extreme values (< 4 or > 10)
4. Quality score should drop to CRITICAL
5. Contamination risk should show "HIGH"

### Test 8: Warehouse Module
1. Update `API_URL` in `hardware/warehouse/sketch.ino`
2. Start Wokwi simulation
3. Toggle PIR motion sensor
4. Occupancy should update in dashboard
5. Distance sensor changes should update storage utilization

---

## 4. Integration Testing

### Full Pipeline Test

**Step 1: Start All Services**
```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Step 2: Submit Test Data**
```bash
# Submit readings for all 4 modules
for i in $(seq 1 10); do
  curl -s -X POST http://localhost:8000/api/readings \
    -H "Content-Type: application/json" \
    -d "{\"module_type\":\"cold_storage\",\"data\":{\"deviceId\":\"COLD_ROOM_TEST\",\"zone\":\"DAIRY\",\"temperature\":$(( RANDOM % 15 + 1 )).$(( RANDOM % 9 )),\"humidity\":$(( RANDOM % 30 + 40 )).0,\"doorOpen\":false,\"doorOpenSeconds\":0,\"gasLevel\":$(( RANDOM % 1000 + 1500 )),\"compressorCurrent\":$(( RANDOM % 5 + 1 )).$(( RANDOM % 9 )),\"compressorOn\":true,\"powerAvailable\":true,\"riskScore\":$(( RANDOM % 40 )),\"status\":\"SAFE\"}}"
  sleep 1
done
```

**Step 3: Verify Data Flow**
```bash
# Check readings were stored
curl "http://localhost:8000/api/readings?device_id=COLD_ROOM_TEST&limit=10"

# Check dashboard updated
curl http://localhost:8000/api/dashboard/summary

# Check analytics generated
curl http://localhost:8000/api/analytics/COLD_ROOM_TEST
```

**Step 4: Open Frontend**
1. Navigate to http://localhost:5173
2. Verify dashboard shows test device
3. Verify charts show data points
4. Navigate through all pages

---

## 5. Performance Testing

### Load Test with curl Loop
```bash
# Send 100 readings rapidly
for i in $(seq 1 100); do
  curl -s -X POST http://localhost:8000/api/readings \
    -H "Content-Type: application/json" \
    -d "{\"module_type\":\"cold_storage\",\"data\":{\"deviceId\":\"LOAD_TEST\",\"zone\":\"TEST\",\"temperature\":5.0,\"humidity\":60.0,\"riskScore\":$(( RANDOM % 100 )),\"status\":\"SAFE\"}}" &
done
wait
echo "Load test complete"
```

### Rate Limiting Test
```bash
# Send 130 requests (should hit 120/min limit)
for i in $(seq 1 130); do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health)
  echo "Request $i: HTTP $response"
done
```

---

## 6. API Documentation Verification

After deploying, verify the interactive docs:

1. Open `https://your-backend-url.onrender.com/docs`
2. Swagger UI should load with all endpoints
3. Try the `/api/auth/login` endpoint to get a token
4. Click the lock icon and enter the token
5. Test protected endpoints through Swagger UI
6. Also check `/redoc` for ReDoc documentation

---

## 7. Automated Test Script

```bash
#!/bin/bash
# test_all.sh - Run all API tests

BASE_URL="http://localhost:8000"
PASS=0
FAIL=0

test_endpoint() {
  local method=$1
  local url=$2
  local data=$3
  local expected=$4

  if [ "$method" = "POST" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d "$data")
  else
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  fi

  if [ "$response" = "$expected" ]; then
    echo "PASS: $method $url -> $response"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $method $url -> $response (expected $expected)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== API Test Suite ==="

# Health check
test_endpoint GET "$BASE_URL/api/health" "" "200"

# Auth
test_endpoint POST "$BASE_URL/api/auth/login" '{"username":"admin","password":"admin123"}' "200"
test_endpoint POST "$BASE_URL/api/auth/register" '{"username":"testuser","email":"test@test.com","password":"test123","role":"viewer"}' "201"

# Readings
test_endpoint POST "$BASE_URL/api/readings" '{"module_type":"cold_storage","data":{"deviceId":"TEST_01","zone":"DAIRY","temperature":5.0,"humidity":60.0,"riskScore":15,"status":"SAFE"}}' "201"

# Devices
test_endpoint GET "$BASE_URL/api/devices" "" "200"
test_endpoint GET "$BASE_URL/api/device/TEST_01" "" "200"

# Dashboard
test_endpoint GET "$BASE_URL/api/dashboard/summary" "" "200"

# Analytics
test_endpoint GET "$BASE_URL/api/analytics" "" "200"

echo ""
echo "Results: $PASS passed, $FAIL failed"
```

Save as `test_all.sh` and run with `bash test_all.sh`.
