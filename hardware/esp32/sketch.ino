#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define DOOR_PIN 4
#define POWER_PIN 5
#define GAS_PIN 34
#define CURRENT_PIN 35
#define COMPRESSOR_LED 18
#define GREEN_LED 19
#define YELLOW_LED 23
#define RED_LED 25
#define BUZZER_PIN 26

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
// Replace with your deployed backend URL after deploying to Render.
// Example: const char* API_URL = "https://cold-storage-api.onrender.com/api/readings";
const char* API_URL = "https://your-backend.example.com/api/readings";

const float MIN_TEMP = 2.0;
const float MAX_TEMP = 8.0;
const float MAX_HUMIDITY = 70.0;
const int GAS_LIMIT = 2600;
const float HIGH_CURRENT_LIMIT = 8.0;
const unsigned long DOOR_LIMIT_MS = 15000;
const unsigned long SEND_INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

unsigned long doorOpenedAt = 0;
unsigned long lastSentAt = 0;
bool compressorOn = false;

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

int calculateRisk(float temperature, float humidity, bool doorOpen,
                  unsigned long doorSeconds, bool powerAvailable,
                  int gasLevel, float compressorCurrent) {
  float temperatureRisk = 0;
  if (temperature > MAX_TEMP) temperatureRisk = clampValue((temperature - MAX_TEMP) * 10, 0, 40);
  if (temperature < MIN_TEMP) temperatureRisk = clampValue((MIN_TEMP - temperature) * 10, 0, 40);

  float humidityRisk = humidity > MAX_HUMIDITY
                         ? clampValue((humidity - MAX_HUMIDITY) * 1.5, 0, 20)
                         : 0;
  float doorRisk = doorOpen ? clampValue(doorSeconds, 0, 15) : 0;
  float powerRisk = powerAvailable ? 0 : 15;
  float gasRisk = gasLevel > GAS_LIMIT ? 10 : 0;
  float currentRisk = compressorCurrent > HIGH_CURRENT_LIMIT ? 10 : 0;
  return (int)clampValue(temperatureRisk + humidityRisk + doorRisk +
                         powerRisk + gasRisk + currentRisk, 0, 100);
}

const char* statusFromRisk(int risk) {
  if (risk >= 80) return "CRITICAL";
  if (risk >= 60) return "HIGH RISK";
  if (risk >= 30) return "WARNING";
  return "SAFE";
}

void setIndicators(int risk, bool criticalFault) {
  digitalWrite(GREEN_LED, risk < 30 && !criticalFault);
  digitalWrite(YELLOW_LED, risk >= 30 && risk < 60 && !criticalFault);
  digitalWrite(RED_LED, risk >= 60 || criticalFault);
  if (risk >= 60 || criticalFault) tone(BUZZER_PIN, 1000);
  else noTone(BUZZER_PIN);
}

void showDisplay(float temperature, float humidity, int risk,
                 const char* status, bool doorOpen, bool powerAvailable) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("COLD STORAGE - ZONE 1");
  display.printf("Temp : %.1f C\n", temperature);
  display.printf("Hum  : %.1f %%\n", humidity);
  display.printf("Door : %s\n", doorOpen ? "OPEN" : "CLOSED");
  display.printf("Power: %s\n", powerAvailable ? "ON" : "FAIL");
  display.printf("Risk : %d%% %s\n", risk, status);
  display.display();
}

String createPayload(float temperature, float humidity, bool doorOpen,
                     unsigned long doorSeconds, bool powerAvailable,
                     int gasLevel, float compressorCurrent, int risk,
                     const char* status) {
  JsonDocument doc;
  doc["deviceId"] = "COLD_ROOM_01";
  doc["zone"] = "DAIRY";
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["doorOpen"] = doorOpen;
  doc["doorOpenSeconds"] = doorSeconds;
  doc["powerAvailable"] = powerAvailable;
  doc["gasLevel"] = gasLevel;
  doc["compressorCurrent"] = compressorCurrent;
  doc["compressorOn"] = compressorOn;
  doc["riskScore"] = risk;
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
  pinMode(DOOR_PIN, INPUT_PULLUP);
  pinMode(POWER_PIN, INPUT_PULLUP);
  pinMode(COMPRESSOR_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED initialization failed");
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Cold Storage Booting...");
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

  bool doorOpen = digitalRead(DOOR_PIN) == LOW;
  bool powerAvailable = digitalRead(POWER_PIN) == HIGH;
  if (doorOpen && doorOpenedAt == 0) doorOpenedAt = millis();
  if (!doorOpen) doorOpenedAt = 0;
  unsigned long doorSeconds = doorOpenedAt ? (millis() - doorOpenedAt) / 1000 : 0;

  int gasLevel = analogRead(GAS_PIN);
  float compressorCurrent = analogRead(CURRENT_PIN) * 10.0 / 4095.0;

  if (!powerAvailable) compressorOn = false;
  else if (temperature > MAX_TEMP) compressorOn = true;
  else if (temperature <= MIN_TEMP) compressorOn = false;
  digitalWrite(COMPRESSOR_LED, compressorOn);

  int risk = calculateRisk(temperature, humidity, doorOpen, doorSeconds,
                           powerAvailable, gasLevel, compressorCurrent);
  bool criticalFault = !powerAvailable || gasLevel > GAS_LIMIT ||
                       doorSeconds * 1000 >= DOOR_LIMIT_MS;
  const char* status = criticalFault && risk < 60 ? "ALERT" : statusFromRisk(risk);

  setIndicators(risk, criticalFault);
  showDisplay(temperature, humidity, risk, status, doorOpen, powerAvailable);

  if (millis() - lastSentAt >= SEND_INTERVAL_MS) {
    lastSentAt = millis();
    String payload = createPayload(temperature, humidity, doorOpen, doorSeconds,
                                   powerAvailable, gasLevel, compressorCurrent,
                                   risk, status);
    sendToBackend(payload);
  }
  delay(1000);
}
