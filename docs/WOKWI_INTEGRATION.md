# Wokwi Integration Guide

## Overview
The ESP32 firmware sends telemetry data every 10 seconds to your deployed backend via REST API. This guide explains how to connect the Wokwi simulation to the live platform.

## Step 1: Deploy Backend First
Follow `deployment/RENDER_DEPLOYMENT.md` to deploy the backend to Render. Note the backend URL (e.g., `https://iot-cold-storage-api.onrender.com`).

## Step 2: Update Firmware API URL
Open `hardware/esp32/sketch.ino` (or the copy in Wokwi) and replace line 24:

**Before:**
```cpp
const char* API_URL = "https://your-backend.example.com/api/readings";
```

**After:**
```cpp
const char* API_URL = "https://iot-cold-storage-api.onrender.com/api/readings";
```

## Step 3: Run Wokwi Simulation
1. Go to https://wokwi.com/projects/new/esp32
2. Copy the updated `sketch.ino` content
3. Copy `diagram.json` content
4. Open Library Manager and add:
   - DHT sensor library
   - Adafruit Unified Sensor
   - Adafruit GFX Library
   - Adafruit SSD1306
   - ArduinoJson
5. Click "Start Simulation"

## Step 4: Verify Data Flow
1. Open Wokwi Serial Monitor - you should see JSON telemetry printed
2. Check Render backend logs for incoming POST requests
3. Open your Vercel dashboard - devices should appear automatically

## Telemetry Payload
Every 10 seconds, the ESP32 sends:
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

## Testing Sensors in Wokwi

### DHT22 (Temperature/Humidity)
- Use the slider to set temperature (0-50°C)
- Use the slider to set humidity (0-100%)

### Door Switch
- Toggle the slide switch
- Connected to ground = door OPEN
- Disconnected = door CLOSED
- Alert triggers after 15 seconds open

### Power Switch
- Toggle the slide switch
- Connected to ground = POWER FAILURE
- Disconnected (default) = power available
- Uses INPUT_PULLUP, so default is HIGH (power on)

### Gas Sensor (Potentiometer)
- Rotate to simulate gas levels (0-4095 ADC)
- Above 2600 triggers gas leak alert

### Current Sensor (Potentiometer)
- Rotate to simulate compressor current (0-10A)
- Above 8A triggers high current warning

## Auto-Device Registration
When the ESP32 sends its first reading, the backend automatically creates a device entry with:
- Device ID: from the `deviceId` field
- Zone: from the `zone` field
- Status: active

No manual registration needed!

## Risk Score Calculation
The firmware calculates a 0-100 risk score:
- Temperature deviation: 0-40 points
- Humidity deviation: 0-20 points
- Door open duration: 0-15 points
- Power failure: 15 points
- Gas level: 10 points
- Abnormal current: 10 points

Status mapping:
- 0-29: SAFE (green LED)
- 30-59: WARNING (yellow LED)
- 60-79: HIGH RISK (red LED)
- 80-100: CRITICAL (red LED + buzzer)
