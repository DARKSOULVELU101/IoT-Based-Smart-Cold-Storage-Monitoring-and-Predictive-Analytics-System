#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define PH_PIN 34
#define TDS_PIN 35
#define WATER_LEVEL_PIN 36
#define FLOW_PIN 39
#define GREEN_LED 4
#define YELLOW_LED 16
#define RED_LED 17
#define BUZZER_PIN 5
#define RELAY_PIN 23

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* API_URL = "https://your-backend.example.com/api/readings";

const float PH_MIN_SAFE = 6.5;
const float PH_MAX_SAFE = 8.5;
const float TDS_SAFE_LIMIT = 500.0;
const float WATER_LEVEL_LOW = 20.0;
const float TEMP_MIN_SAFE = 5.0;
const float TEMP_MAX_SAFE = 35.0;
const unsigned long SEND_INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

unsigned long lastSentAt = 0;
bool relayOn = false;

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

int calculateQualityScore(float ph, float tds, float waterLevel, float flowRate, float temperature) {
  float phScore = 100.0;
  if (ph < PH_MIN_SAFE || ph > PH_MAX_SAFE) {
    float dev = max(PH_MIN_SAFE - ph, ph - PH_MAX_SAFE);
    phScore = 100.0 - clampValue(dev / 3.0 * 100.0, 0, 100);
  }

  float tdsScore = 100.0;
  if (tds > TDS_SAFE_LIMIT) {
    tdsScore = 100.0 - clampValue((tds - TDS_SAFE_LIMIT) / 500.0 * 100.0, 0, 100);
  }

  float levelScore = 100.0;
  if (waterLevel < WATER_LEVEL_LOW) {
    levelScore = clampValue(waterLevel / WATER_LEVEL_LOW * 100.0, 0, 100);
  }

  float flowScore = flowRate > 0 ? 100.0 : 0.0;

  float tempScore = 100.0;
  if (temperature < TEMP_MIN_SAFE || temperature > TEMP_MAX_SAFE) {
    float dev = max(TEMP_MIN_SAFE - temperature, temperature - TEMP_MAX_SAFE);
    tempScore = 100.0 - clampValue(dev / 20.0 * 100.0, 0, 100);
  }

  float score = phScore * 0.30 + tdsScore * 0.30 + levelScore * 0.20 + flowScore * 0.10 + tempScore * 0.10;
  return (int)clampValue(score, 0, 100);
}

const char* statusFromScore(int score) {
  if (score >= 80) return "NORMAL";
  if (score >= 50) return "WARNING";
  return "CRITICAL";
}

const char* contaminationRisk(float ph, float tds, float temperature) {
  bool phBad = ph < PH_MIN_SAFE || ph > PH_MAX_SAFE;
  bool tdsHigh = tds > TDS_SAFE_LIMIT * 2;
  bool tempBad = temperature > TEMP_MAX_SAFE || temperature < TEMP_MIN_SAFE;
  if (phBad && tdsHigh && tempBad) return "HIGH";
  if (phBad || tdsHigh) return "MEDIUM";
  return "LOW";
}

void setIndicators(int score, bool criticalFault) {
  digitalWrite(GREEN_LED, score >= 80 && !criticalFault);
  digitalWrite(YELLOW_LED, score >= 50 && score < 80 && !criticalFault);
  digitalWrite(RED_LED, score < 50 || criticalFault);
  if (score < 50 || criticalFault) tone(BUZZER_PIN, 1000);
  else noTone(BUZZER_PIN);
}

void showDisplay(float ph, float tds, float waterLevel, float flowRate,
                 float temperature, int score, const char* status) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("WATER QUALITY MONITOR");
  display.printf("pH   : %.2f\n", ph);
  display.printf("TDS  : %.0f ppm\n", tds);
  display.printf("Level: %.1f%%\n", waterLevel);
  display.printf("Flow : %.1f L/m\n", flowRate);
  display.printf("Temp : %.1f C\n", temperature);
  display.printf("Score: %d%% %s\n", score, status);
  display.printf("Relay: %s\n", relayOn ? "ON" : "OFF");
  display.display();
}

String createPayload(float ph, float tds, float waterLevel, float flowRate,
                     float temperature, int score, const char* status, const char* risk) {
  JsonDocument doc;
  doc["deviceId"] = "WATER_01";
  doc["moduleType"] = "water-quality";
  doc["ph"] = ph;
  doc["tds"] = tds;
  doc["waterLevel"] = waterLevel;
  doc["flowRate"] = flowRate;
  doc["temperature"] = temperature;
  doc["qualityScore"] = score;
  doc["relayOn"] = relayOn;
  doc["contaminationRisk"] = risk;
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
  pinMode(PH_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT);
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
  display.println("Water Quality Booting...");
  display.display();
  connectWiFi();
}

void loop() {
  float temperature = dht.readTemperature();
  if (isnan(temperature)) {
    Serial.println("DHT22 read error");
    delay(1000);
    return;
  }

  float ph = analogRead(PH_PIN) * 14.0 / 4095.0;
  float tds = analogRead(TDS_PIN) * 1000.0 / 4095.0;
  float waterLevel = analogRead(WATER_LEVEL_PIN) * 100.0 / 4095.0;
  float flowRate = analogRead(FLOW_PIN) * 10.0 / 4095.0;

  bool criticalFault = tds > TDS_SAFE_LIMIT * 2 || ph < 4.0 || ph > 10.0;
  relayOn = !criticalFault;
  digitalWrite(RELAY_PIN, relayOn ? HIGH : LOW);

  int score = calculateQualityScore(ph, tds, waterLevel, flowRate, temperature);
  const char* status = statusFromScore(score);
  const char* risk = contaminationRisk(ph, tds, temperature);

  setIndicators(score, criticalFault);
  showDisplay(ph, tds, waterLevel, flowRate, temperature, score, status);

  if (millis() - lastSentAt >= SEND_INTERVAL_MS) {
    lastSentAt = millis();
    String payload = createPayload(ph, tds, waterLevel, flowRate, temperature, score, status, risk);
    sendToBackend(payload);
  }
  delay(1000);
}
