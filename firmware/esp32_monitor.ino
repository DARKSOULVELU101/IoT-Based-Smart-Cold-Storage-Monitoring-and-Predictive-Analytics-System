// IoT Smart Cold Storage & Monitoring System
// ESP32 Firmware for Wokwi Simulation
// Supports: Temperature, Humidity, Gas, Water Quality, Machine Vibration
// API Endpoint: POST /api/telemetry/ingest
// Heartbeat:   POST /api/devices/{id}/heartbeat

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ===== CONFIGURATION =====
// Change these values based on your setup
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";
const char* API_BASE_URL = "http://10.0.2.2:8000";  // Wokwi: host machine
// For production, use your actual server URL:
// const char* API_BASE_URL = "https://your-api.onrender.com";

const int DEVICE_ID = 1;              // Match database device ID
const int REPORT_INTERVAL = 30000;    // 30 seconds
const int HEARTBEAT_INTERVAL = 60000; // 60 seconds

// ===== PIN DEFINITIONS =====
#define DHT_PIN 15          // DHT22 temperature/humidity sensor
#define DHT_TYPE DHT22
#define GAS_SENSOR_PIN 34   // MQ-135 gas sensor (analog)
#define PH_SENSOR_PIN 35    // pH sensor (analog)
#define TDS_SENSOR_PIN 32   // TDS sensor (analog)
#define VIBRATION_PIN 33    // MPU6050 / vibration sensor
#define LED_STATUS_PIN 2    // Built-in LED for status

// ===== OBJECTS =====
DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastReport = 0;
unsigned long lastHeartbeat = 0;
bool wifiConnected = false;

// ===== SETUP =====
void setup() {
    Serial.begin(115200);
    Serial.println("\n=== IoT Monitoring Device Starting ===");
    Serial.printf("Device ID: %d\n", DEVICE_ID);

    // Pin setup
    pinMode(LED_STATUS_PIN, OUTPUT);
    pinMode(GAS_SENSOR_PIN, INPUT);
    pinMode(PH_SENSOR_PIN, INPUT);
    pinMode(TDS_SENSOR_PIN, INPUT);
    pinMode(VIBRATION_PIN, INPUT);

    // Initialize DHT sensor
    dht.begin();

    // Connect to WiFi
    connectWiFi();

    Serial.println("=== Device Ready ===\n");
}

// ===== MAIN LOOP =====
void loop() {
    // Ensure WiFi stays connected
    if (WiFi.status() != WL_CONNECTED) {
        wifiConnected = false;
        connectWiFi();
    } else {
        wifiConnected = true;
    }

    unsigned long now = millis();

    // Send telemetry data
    if (now - lastReport >= REPORT_INTERVAL) {
        lastReport = now;
        sendTelemetry();
    }

    // Send heartbeat
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
        lastHeartbeat = now;
        sendHeartbeat();
    }

    // Blink LED to show activity
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
    delay(100);
}

// ===== WIFI CONNECTION =====
void connectWiFi() {
    Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
        wifiConnected = true;
    } else {
        Serial.println("\nWiFi connection failed. Retrying...");
        wifiConnected = false;
    }
}

// ===== SENSOR READING =====
float readTemperature() {
    float temp = dht.readTemperature();
    if (isnan(temp)) {
        Serial.println("DHT read failed, using simulated value");
        return 20.0 + random(-50, 50) / 10.0;  // Simulated 15-25°C
    }
    return temp;
}

float readHumidity() {
    float hum = dht.readHumidity();
    if (isnan(hum)) {
        Serial.println("DHT humidity read failed, using simulated value");
        return 50.0 + random(-200, 200) / 10.0;
    }
    return hum;
}

float readGasLevel() {
    int raw = analogRead(GAS_SENSOR_PIN);
    return map(raw, 0, 4095, 0, 500);  // Convert to ppm
}

float readWaterPH() {
    int raw = analogRead(PH_SENSOR_PIN);
    float voltage = raw * (3.3 / 4095.0);
    float ph = 7.0 + (1.65 - voltage) * 3.0;  // Simplified pH calculation
    return constrain(ph, 0.0, 14.0);
}

float readTDS() {
    int raw = analogRead(TDS_SENSOR_PIN);
    float voltage = raw * (3.3 / 4095.0);
    float tds = (133.42 * voltage * voltage * voltage
               - 255.86 * voltage * voltage
               + 857.39 * voltage) * 0.5;
    return constrain(tds, 0.0, 1000.0);
}

float readTurbidity() {
    // Simulated turbidity based on TDS
    float tds = readTDS();
    return tds / 50.0 + random(-10, 10) / 10.0;
}

float readVibration() {
    int raw = analogRead(VIBRATION_PIN);
    return map(raw, 0, 4095, 0, 100) / 10.0;  // 0-10 scale
}

// ===== CALCULATE SCORES =====
float calculateHealthScore(float vibration, float temperature) {
    float score = 100.0;
    if (vibration > 7.0) score -= 30.0;
    else if (vibration > 5.0) score -= 15.0;
    if (temperature > 40.0) score -= 20.0;
    else if (temperature < -10.0) score -= 20.0;
    return constrain(score + random(-5, 5), 0.0, 100.0);
}

float calculateWaterQualityScore(float ph, float tds, float turbidity) {
    float score = 100.0;
    if (ph < 6.5 || ph > 8.5) score -= 30.0;
    else if (ph < 6.8 || ph > 8.2) score -= 10.0;
    if (tds > 500) score -= 30.0;
    else if (tds > 300) score -= 15.0;
    if (turbidity > 10) score -= 25.0;
    else if (turbidity > 5) score -= 10.0;
    return constrain(score + random(-3, 3), 0.0, 100.0);
}

float calculateRiskScore(float temp, float humidity, float gas, float vibration, float healthScore) {
    float risk = 0.0;
    if (temp > 40 || temp < -10) risk += 20.0;
    else if (temp > 35 || temp < 0) risk += 10.0;
    if (humidity > 90) risk += 15.0;
    else if (humidity > 80) risk += 5.0;
    if (gas > 300) risk += 20.0;
    else if (gas > 200) risk += 10.0;
    if (vibration > 7) risk += 15.0;
    risk += (100 - healthScore) * 0.3;
    return constrain(risk + random(-3, 3), 0.0, 100.0);
}

// ===== SEND TELEMETRY =====
void sendTelemetry() {
    if (!wifiConnected) {
        Serial.println("WiFi not connected, skipping telemetry");
        return;
    }

    // Read all sensors
    float temperature = readTemperature();
    float humidity = readHumidity();
    float gasLevel = readGasLevel();
    float waterPH = readWaterPH();
    float tds = readTDS();
    float turbidity = readTurbidity();
    float vibration = readVibration();
    bool powerStatus = true;

    // Calculate scores
    float healthScore = calculateHealthScore(vibration, temperature);
    float waterQuality = calculateWaterQualityScore(waterPH, tds, turbidity);
    float riskScore = calculateRiskScore(temperature, humidity, gasLevel, vibration, healthScore);

    // Build JSON
    StaticJsonDocument<512> doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = round(temperature * 100.0) / 100.0;
    doc["humidity"] = round(humidity * 100.0) / 100.0;
    doc["power_status"] = powerStatus;
    doc["gas_level"] = round(gasLevel * 100.0) / 100.0;
    doc["water_ph"] = round(waterPH * 100.0) / 100.0;
    doc["water_turbidity"] = round(turbidity * 100.0) / 100.0;
    doc["water_tds"] = round(tds * 100.0) / 100.0;
    doc["vibration_level"] = round(vibration * 100.0) / 100.0;
    doc["machine_health_score"] = round(healthScore * 100.0) / 100.0;
    doc["water_quality_score"] = round(waterQuality * 100.0) / 100.0;
    doc["risk_score"] = round(riskScore * 100.0) / 100.0;

    String jsonString;
    serializeJson(doc, jsonString);

    // Send via HTTP POST
    HTTPClient http;
    String url = String(API_BASE_URL) + "/api/telemetry/ingest";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    Serial.println("--- Sending Telemetry ---");
    Serial.printf("Temp: %.1f°C | Hum: %.1f%% | Gas: %.0f ppm\n", temperature, humidity, gasLevel);
    Serial.printf("pH: %.2f | TDS: %.0f | Turb: %.1f\n", waterPH, tds, turbidity);
    Serial.printf("Vibration: %.1f | Health: %.0f%% | WQ: %.0f%% | Risk: %.0f%%\n", vibration, healthScore, waterQuality, riskScore);

    int httpCode = http.POST(jsonString);

    if (httpCode > 0) {
        Serial.printf("Telemetry sent! Response: %d\n", httpCode);
        if (httpCode == 200 || httpCode == 201) {
            Serial.println("Data ingested successfully");
        }
    } else {
        Serial.printf("Telemetry failed: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

// ===== SEND HEARTBEAT =====
void sendHeartbeat() {
    if (!wifiConnected) return;

    HTTPClient http;
    String url = String(API_BASE_URL) + "/api/devices/" + String(DEVICE_ID) + "/heartbeat";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST("{}");

    if (httpCode > 0) {
        Serial.printf("Heartbeat sent! Response: %d\n", httpCode);
    } else {
        Serial.printf("Heartbeat failed: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}
