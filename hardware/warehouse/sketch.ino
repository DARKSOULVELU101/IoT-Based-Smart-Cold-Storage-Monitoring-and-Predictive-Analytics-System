#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define PIR_PIN 13
#define ULTRASONIC_TRIG 27
#define ULTRASONIC_ECHO 26
#define AIR_QUALITY_PIN 34
#define GREEN_LED 4
#define YELLOW_LED 16
#define RED_LED 17
#define BUZZER_PIN 5
#define RELAY_PIN 23

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* API_URL = "https://your-backend.example.com/api/readings";

const float TEMP_MAX_SAFE = 35.0;
const float HUMIDITY_MAX_SAFE = 70.0;
const float AIR_QUALITY_LIMIT = 2048.0;
const float DISTANCE_MIN = 10.0;
const float DISTANCE_MAX = 400.0;
const unsigned long SEND_INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

unsigned long lastSentAt = 0;
bool relayOn = false;
bool motionDetected = false;
unsigned long lastMotionTime = 0;
int occupancy = 0;

float clampValue(float value, float low, float high) {
  return max(low, min(value, high));
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting to Wokwi WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 10000) {
    delay(250);
    Serial.print('.');
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? " connected" : " offline mode");
}

float readUltrasonic() {
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);
  if (duration == 0) return DISTANCE_MAX;
  return duration * 0.034 / 2.0;
}

int calculateWarehouseScore(float temperature, float humidity, bool motion,
                             float distance, float airQuality) {
  float tempScore = 100.0;
  if (temperature > TEMP_MAX_SAFE) {
    tempScore = 100.0 - clampValue((temperature - TEMP_MAX_SAFE) / 15.0 * 100.0, 0, 100);
  }

  float humScore = 100.0;
  if (humidity > HUMIDITY_MAX_SAFE) {
    humScore = 100.0 - clampValue((humidity - HUMIDITY_MAX_SAFE) / 30.0 * 100.0, 0, 100);
  }

  float airScore = 100.0;
  if (airQuality > AIR_QUALITY_LIMIT) {
    airScore = 100.0 - clampValue((airQuality - AIR_QUALITY_LIMIT) / 2048.0 * 100.0, 0, 100);
  }

  float storageUtil = clampValue((DISTANCE_MAX - distance) / (DISTANCE_MAX - DISTANCE_MIN) * 100.0, 0, 100);
  float storageScore = storageUtil > 90.0 ? 50.0 : (storageUtil > 80.0 ? 75.0 : 100.0);

  float motionScore = motion ? 90.0 : 100.0;

  float score = tempScore * 0.25 + humScore * 0.20 + airScore * 0.25 + storageScore * 0.15 + motionScore * 0.15;
  return (int)clampValue(score, 0, 100);
}

const char* statusFromScore(int score) {
  if (score >= 80) return "NORMAL";
  if (score >= 50) return "WARNING";
  return "CRITICAL";
}

void setIndicators(int score, bool criticalFault) {
  digitalWrite(GREEN_LED, score >= 80 && !criticalFault);
  digitalWrite(YELLOW_LED, score >= 50 && score < 80 && !criticalFault);
  digitalWrite(RED_LED, score < 50 || criticalFault);
  if (score < 50 || criticalFault) tone(BUZZER_PIN, 1000);
  else noTone(BUZZER_PIN);
}

void showDisplay(float temperature, float humidity, bool motion, float distance,
                 float airQuality, int occupancy, float storageUtil, int score, const char* status) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("WAREHOUSE MONITOR");
  display.printf("Temp : %.1f C\n", temperature);
  display.printf("Hum  : %.1f %%\n", humidity);
  display.printf("Motion: %s\n", motion ? "YES" : "NO");
  display.printf("Dist : %.0f cm\n", distance);
  display.printf("AQ   : %.0f\n", airQuality);
  display.printf("Util : %.0f%% Score:%d%%\n", storageUtil, score);
  display.printf("%s  Occ:%d\n", status, occupancy);
  display.display();
}

String createPayload(float temperature, float humidity, bool motion, float distance,
                     float airQuality, int occupancy, float storageUtil, int score,
                     const char* status) {
  JsonDocument doc;
  doc["deviceId"] = "WAREHOUSE_01";
  doc["moduleType"] = "warehouse";
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["motionDetected"] = motion;
  doc["distance"] = distance;
  doc["airQuality"] = airQuality;
  doc["occupancy"] = occupancy;
  doc["storageUtilization"] = storageUtil;
  doc["warehouseScore"] = score;
  doc["relayOn"] = relayOn;
  doc["status"] = status;
  String json;
  serializeJson(doc, json);
  return json;
}

void sendToBackend(const String& payload) {
  Serial.println("Telemetry: " + payload);
  if (String(API_URL).indexOf("your-backend") >= 0) {
    Serial.println("API skipped: replace API_URL to enable cloud upload.");
    return;
  }
  connectWiFi();
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  if (!http.begin(client, API_URL)) return;
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  Serial.printf("API response: %d\n", code);
  if (code > 0) Serial.println(http.getString());
  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIR_PIN, INPUT);
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  pinMode(AIR_QUALITY_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED initialization failed");
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Warehouse Booting...");
  display.display();
  connectWiFi();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT22 read error");
    delay(1000);
    return;
  }

  bool pirState = digitalRead(PIR_PIN) == HIGH;
  if (pirState) {
    lastMotionTime = millis();
    motionDetected = true;
  } else if (millis() - lastMotionTime > 5000) {
    motionDetected = false;
  }

  float distance = readUltrasonic();
  float airQuality = analogRead(AIR_QUALITY_PIN);
  float storageUtil = clampValue((DISTANCE_MAX - distance) / (DISTANCE_MAX - DISTANCE_MIN) * 100.0, 0, 100);

  occupancy = motionDetected ? 1 : 0;

  bool criticalFault = temperature > TEMP_MAX_SAFE + 15 || humidity > HUMIDITY_MAX_SAFE + 15 || airQuality > AIR_QUALITY_LIMIT * 1.5;
  relayOn = !criticalFault;
  digitalWrite(RELAY_PIN, relayOn ? HIGH : LOW);

  int score = calculateWarehouseScore(temperature, humidity, motionDetected, distance, airQuality);
  const char* status = statusFromScore(score);

  setIndicators(score, criticalFault);
  showDisplay(temperature, humidity, motionDetected, distance, airQuality, occupancy, storageUtil, score, status);

  if (millis() - lastSentAt >= SEND_INTERVAL_MS) {
    lastSentAt = millis();
    String payload = createPayload(temperature, humidity, motionDetected, distance, airQuality, occupancy, storageUtil, score, status);
    sendToBackend(payload);
  }
  delay(1000);
}
