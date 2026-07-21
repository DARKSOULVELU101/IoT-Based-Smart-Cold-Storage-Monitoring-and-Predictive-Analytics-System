# Wokwi Setup Guide - IoT Analytics Suite

## Overview

This guide covers setting up all four ESP32 modules in the Wokwi online simulator. Each module simulates different IoT sensors and sends telemetry to your deployed backend.

---

## Prerequisites

1. Backend deployed on Render (see `deployment/DEPLOYMENT_GUIDE.md`)
2. Wokwi account at https://wokwi.com
3. Backend URL noted (e.g., `https://iot-analytics-suite-api.onrender.com`)

---

## Module 1: Cold Storage

### Purpose
Monitors refrigerated storage environments for food/pharmaceutical safety.

### Components

| Component | Wokwi Part | Pin | Function |
|-----------|-----------|-----|----------|
| DHT22 | `wokwi-dht22` | GPIO 15 | Temperature & humidity |
| Door Switch | `wokwi-slide-switch` | GPIO 4 | Door open/closed detection |
| Power Switch | `wokwi-slide-switch` | GPIO 5 | Power failure simulation |
| Gas Sensor | `wokwi-potentiometer` | GPIO 34 | Gas level (0-4095 ADC) |
| Current Sensor | `wokwi-potentiometer` | GPIO 35 | Compressor current (0-10A) |
| Green LED | `wokwi-led` | GPIO 19 | Safe status |
| Yellow LED | `wokwi-led` | GPIO 23 | Warning status |
| Red LED | `wokwi-led` | GPIO 25 | High risk / critical |
| Buzzer | `wokwi-buzzer` | GPIO 26 | Critical alert sound |
| Compressor LED | `wokwi-led` | GPIO 18 | Compressor on indicator |
| OLED Display | `wokwi-ssd1306` | I2C (21,22) | Real-time display |

### Setup Steps

1. Go to https://wokwi.com/projects/new/esp32
2. Delete the default `Blink` example
3. Copy content from `hardware/cold-storage/sketch.ino` into the code editor
4. Copy content from `hardware/cold-storage/diagram.json` into the diagram editor
5. Open Library Manager (search icon) and add:
   - `DHT sensor library` by Adafruit
   - `Adafruit Unified Sensor`
   - `Adafruit GFX Library`
   - `Adafruit SSD1306`
   - `ArduinoJson`
6. Update the `API_URL` constant in the code:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

7. Click **Start Simulation**

### Pin Mapping

```
ESP32 Pin Assignment (Cold Storage):
├── GPIO 15 ──── DHT22 Data
├── GPIO 4  ──── Door Switch (INPUT_PULLUP)
├── GPIO 5  ──── Power Switch (INPUT_PULLUP)
├── GPIO 34 ──── Gas Sensor (ADC)
├── GPIO 35 ──── Current Sensor (ADC)
├── GPIO 18 ──── Compressor LED
├── GPIO 19 ──── Green LED
├── GPIO 23 ──── Yellow LED
├── GPIO 25 ──── Red LED
├── GPIO 26 ──── Buzzer
├── GPIO 21 ──── OLED SDA
├── GPIO 22 ──── OLED SCL
└── 3.3V/5V ──── Sensor Power
```

### Expected Serial Output

```
Cold Storage Booting...
Connecting to Wokwi WiFi..... connected
Telemetry: {"deviceId":"COLD_ROOM_01","zone":"DAIRY","temperature":24.50,"humidity":65.20,"doorOpen":false,"doorOpenSeconds":0,"powerAvailable":true,"gasLevel":1823,"compressorCurrent":3.40,"compressorOn":true,"riskScore":42,"status":"WARNING"}
API response: 201
{"id":"...","device_id":"COLD_ROOM_01","module_type":"cold_storage","risk_score":42,"status":"WARNING","created_at":"..."}
```

### Testing Sensors

| Action | Expected Result |
|--------|----------------|
| Set DHT22 temp > 8C | Risk score increases, yellow/red LED |
| Toggle door switch ON for 15s | Door open alert, risk increases |
| Rotate gas pot > 2600 | Gas leak alert, red LED + buzzer |
| Toggle power switch | Power failure alert, compressor off |
| Rotate current pot > 8A | High current warning |

---

## Module 2: Machine Health

### Purpose
Monitors industrial machinery for predictive maintenance.

### Components

| Component | Wokwi Part | Pin | Function |
|-----------|-----------|-----|----------|
| DHT22 | `wokwi-dht22` | GPIO 15 | Motor temperature |
| Vibration Sensor | `wokwi-potentiometer` | GPIO 34 | Vibration level (0-4095) |
| Current Sensor | `wokwi-potentiometer` | GPIO 35 | Motor current (0-10A) |
| Voltage Sensor | `wokwi-potentiometer` | GPIO 36 | Supply voltage (0-300V) |
| Green LED | `wokwi-led` | GPIO 4 | Normal health |
| Yellow LED | `wokwi-led` | GPIO 16 | Warning |
| Red LED | `wokwi-led` | GPIO 17 | Critical |
| Buzzer | `wokwi-buzzer` | GPIO 5 | Critical alert |
| Relay | `wokwi-led` | GPIO 23 | Safety relay (shutdown) |
| OLED Display | `wokwi-ssd1306` | I2C (21,22) | Real-time display |

### Setup Steps

1. Go to https://wokwi.com/projects/new/esp32
2. Copy content from `hardware/machine-health/sketch.ino`
3. Copy content from `hardware/machine-health/diagram.json`
4. Add required libraries (same as Cold Storage)
5. Update `API_URL`:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

6. Start Simulation

### Pin Mapping

```
ESP32 Pin Assignment (Machine Health):
├── GPIO 15 ──── DHT22 Data
├── GPIO 34 ──── Vibration Sensor (ADC)
├── GPIO 35 ──── Current Sensor (ADC)
├── GPIO 36 ──── Voltage Sensor (ADC)
├── GPIO 4  ──── Green LED
├── GPIO 16 ──── Yellow LED
├── GPIO 17 ──── Red LED
├── GPIO 5  ──── Buzzer
├── GPIO 23 ──── Safety Relay (LED)
├── GPIO 21 ──── OLED SDA
├── GPIO 22 ──── OLED SCL
└── 3.3V/5V ──── Sensor Power
```

### Health Score Calculation

```
Health Score = Temp(30%) + Vibration(30%) + Current(25%) + Voltage(15%)

Temp Score:    100 → 0 as temp goes 50C → 70C
Vib Score:     100 → 0 as vibration goes 2048 → 3072
Current Score: 100 → 0 as current goes 7A → 9A
Voltage Score: 100 → 0 as voltage deviates from 200-250V range

Status: >= 80 NORMAL | 50-79 WARNING | < 50 CRITICAL
```

### Testing Sensors

| Action | Expected Result |
|--------|----------------|
| Set DHT22 temp > 70C | Health score drops, relay off |
| Rotate vibration > 3072 | Critical vibration, shutdown |
| Rotate current > 9A | High current, relay off |
| Rotate voltage outside 200-250V | Voltage warning |

---

## Module 3: Water Quality

### Purpose
Monitors water treatment and distribution systems.

### Components

| Component | Wokwi Part | Pin | Function |
|-----------|-----------|-----|----------|
| DHT22 | `wokwi-dht22` | GPIO 15 | Water temperature |
| pH Sensor | `wokwi-potentiometer` | GPIO 34 | pH level (0-14) |
| TDS Sensor | `wokwi-potentiometer` | GPIO 35 | Total dissolved solids |
| Water Level | `wokwi-potentiometer` | GPIO 36 | Tank level (0-100%) |
| Flow Sensor | `wokwi-potentiometer` | GPIO 39 | Flow rate (0-10 L/m) |
| Green LED | `wokwi-led` | GPIO 4 | Normal quality |
| Yellow LED | `wokwi-led` | GPIO 16 | Warning |
| Red LED | `wokwi-led` | GPIO 17 | Critical |
| Buzzer | `wokwi-buzzer` | GPIO 5 | Critical alert |
| Valve Relay | `wokwi-led` | GPIO 23 | Water valve control |
| OLED Display | `wokwi-ssd1306` | I2C (21,22) | Real-time display |

### Setup Steps

1. Go to https://wokwi.com/projects/new/esp32
2. Copy content from `hardware/water-quality/sketch.ino`
3. Copy content from `hardware/water-quality/diagram.json`
4. Add required libraries
5. Update `API_URL`:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

6. Start Simulation

### Pin Mapping

```
ESP32 Pin Assignment (Water Quality):
├── GPIO 15 ──── DHT22 Data
├── GPIO 34 ──── pH Sensor (ADC)
├── GPIO 35 ──── TDS Sensor (ADC)
├── GPIO 36 ──── Water Level (ADC)
├── GPIO 39 ──── Flow Sensor (ADC)
├── GPIO 4  ──── Green LED
├── GPIO 16 ──── Yellow LED
├── GPIO 17 ──── Red LED
├── GPIO 5  ──── Buzzer
├── GPIO 23 ──── Valve Relay (LED)
├── GPIO 21 ──── OLED SDA
├── GPIO 22 ──── OLED SCL
└── 3.3V/5V ──── Sensor Power
```

### Quality Score Calculation

```
Quality Score = pH(30%) + TDS(30%) + Level(20%) + Flow(10%) + Temp(10%)

pH Score:    100 → 0 as pH deviates from 6.5-8.5 range
TDS Score:   100 → 0 as TDS goes 500 → 1000 ppm
Level Score: 100 → 0 as level drops below 20%
Flow Score:  100 if flow > 0, else 0
Temp Score:  100 → 0 as temp deviates from 5-35C

Status: >= 80 NORMAL | 50-79 WARNING | < 50 CRITICAL
Contamination Risk: LOW / MEDIUM / HIGH
```

### Testing Sensors

| Action | Expected Result |
|--------|----------------|
| Rotate pH < 4 or > 10 | pH critical, quality drops |
| Rotate TDS > 1000 | High TDS alert |
| Rotate water level < 20% | Low water alert |
| Rotate flow to 0 | No flow warning |

---

## Module 4: Warehouse

### Purpose
Monitors warehouse conditions and occupancy.

### Components

| Component | Wokwi Part | Pin | Function |
|-----------|-----------|-----|----------|
| DHT22 | `wokwi-dht22` | GPIO 15 | Air temperature & humidity |
| PIR Sensor | `wokwi-pir-sensor` | GPIO 13 | Motion detection |
| Ultrasonic | `wokwi-hc-sr04` | GPIO 27 (trig), 26 (echo) | Distance / occupancy |
| Air Quality | `wokwi-potentiometer` | GPIO 34 | MQ-135 air quality |
| Green LED | `wokwi-led` | GPIO 4 | Normal conditions |
| Yellow LED | `wokwi-led` | GPIO 16 | Warning |
| Red LED | `wokwi-led` | GPIO 17 | Critical |
| Buzzer | `wokwi-buzzer` | GPIO 5 | Critical alert |
| HVAC Relay | `wokwi-led` | GPIO 23 | HVAC control |
| OLED Display | `wokwi-ssd1306` | I2C (21,22) | Real-time display |

### Setup Steps

1. Go to https://wokwi.com/projects/new/esp32
2. Copy content from `hardware/warehouse/sketch.ino`
3. Copy content from `hardware/warehouse/diagram.json`
4. Add required libraries
5. Update `API_URL`:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

6. Start Simulation

### Pin Mapping

```
ESP32 Pin Assignment (Warehouse):
├── GPIO 15 ──── DHT22 Data
├── GPIO 13 ──── PIR Motion Sensor
├── GPIO 27 ──── Ultrasonic Trigger
├── GPIO 26 ──── Ultrasonic Echo
├── GPIO 34 ──── Air Quality (ADC)
├── GPIO 4  ──── Green LED
├── GPIO 16 ──── Yellow LED
├── GPIO 17 ──── Red LED
├── GPIO 5  ──── Buzzer
├── GPIO 23 ──── HVAC Relay (LED)
├── GPIO 21 ──── OLED SDA
├── GPIO 22 ──── OLED SCL
└── 3.3V/5V ──── Sensor Power
```

### Warehouse Score Calculation

```
Warehouse Score = Temp(25%) + Humidity(20%) + AirQuality(25%) + StorageUtil(15%) + Motion(15%)

Temp Score:        100 → 0 as temp goes 35C → 50C
Humidity Score:    100 → 0 as humidity goes 70% → 100%
Air Quality Score: 100 → 0 as AQ goes 2048 → 4096
Storage Score:     100 → 50 as utilization goes 80% → 90%
Motion Score:      90 if motion detected, else 100

Status: >= 80 NORMAL | 50-79 WARNING | < 50 CRITICAL
```

### Testing Sensors

| Action | Expected Result |
|--------|----------------|
| Trigger PIR sensor | Occupancy count increases |
| Move ultrasonic closer | Storage utilization increases |
| Rotate air quality > 2048 | Air quality warning |
| Set temp > 35C | Temperature warning |

---

## Common Configuration

### API URL Configuration

In every sketch.ino, find and update this line:

```cpp
const char* API_URL = "https://your-backend.example.com/api/readings";
```

Replace with your actual backend URL:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

### WiFi Configuration

All modules use Wokwi's guest WiFi:

```cpp
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
```

This only works inside the Wokwi simulator. For physical hardware, update these values.

### Required Libraries (All Modules)

Add these in Wokwi's Library Manager:

| Library | Author |
|---------|--------|
| DHT sensor library | Adafruit |
| Adafruit Unified Sensor | Adafruit |
| Adafruit GFX Library | Adafruit |
| Adafruit SSD1306 | Adafruit |
| ArduinoJson | Benoit Blanchon |

---

## Troubleshooting

### "API skipped: replace API_URL"
- The default `API_URL` contains `your-backend`
- Update it with your actual Render URL

### WiFi Connection Fails
- Wokwi WiFi only works during simulation
- Check that `WIFI_SSID` is `Wokwi-GUEST`

### DHT22 Read Error
- Normal during first second after boot
- If persistent, check wiring in diagram.json

### No Data in Dashboard
- Verify backend is running (check `/api/health`)
- Verify CORS_ORIGINS includes your frontend URL
- Check browser console for network errors
- Check Serial Monitor for HTTP response codes

### HTTP 429 (Rate Limited)
- ESP32 sends every 10 seconds (6/min per device)
- Rate limit is 120 req/min total
- This is normal with a single device

### HTTP 500 (Server Error)
- Check Render logs for Python traceback
- Verify DATABASE_URL is correct
- Ensure all tables are created (auto on first request)
