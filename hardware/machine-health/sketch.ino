#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define VIBRATION_PIN 34
#define CURRENT_PIN 35
#define VOLTAGE_PIN 36
#define GREEN_LED 4
#define YELLOW_LED 16
#define RED_LED 17
#define BUZZER_PIN 5
#define RELAY_PIN 23

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";
const char* API_URL = "https://your-backend.example.com/api/readings";

const float TEMP_WARNING = 50.0;
const float TEMP_CRITICAL = 70.0;
const float VIBRATION_WARNING = 2048.0;
const float VIBRATION_CRITICAL = 3072.0;
const float CURRENT_WARNING = 7.0;
const float CURRENT_CRITICAL = 9.0;
const float VOLTAGE_LOW = 200.0;
const float VOLTAGE_HIGH = 250.0;
const unsigned long SEND_INTERVAL_MS = 10000;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

unsigned long lastSentAt = 0;
unsigned long machineStartTime = 0;
bool relayOn = false;
bool previousMotionState = false;

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

int calculateHealthScore(float temperature, float vibration, float current, float voltage) {
  float tempScore = 100.0;
  if (temperature > TEMP_CRITICAL) tempScore = 0;
  else if (temperature > TEMP_WARNING) tempScore = 100.0 - ((temperature - TEMP_WARNING) / (TEMP_CRITICAL - TEMP_WARNING)) * 100.0;

  float vibScore = 100.0;
  if (vibration > VIBRATION_CRITICAL) vibScore = 0;
  else if (vibration > VIBRATION_WARNING) vibScore = 100.0 - ((vibration - VIBRATION_WARNING) / (VIBRATION_CRITICAL - VIBRATION_WARNING)) * 100.0;

  float curScore = 100.0;
  if (current > CURRENT_CRITICAL) curScore = 0;
  else if (current > CURRENT_WARNING) curScore = 100.0 - ((current - CURRENT_WARNING) / (CURRENT_CRITICAL - CURRENT_WARNING)) * 100.0;

  float volScore = 100.0;
  if (voltage < VOLTAGE_LOW || voltage > VOLTAGE_HIGH) {
    float dev = max(VOLTAGE_LOW - voltage, voltage - VOLTAGE_HIGH);
    volScore = 100.0 - clampValue(dev / 50.0 * 100.0, 0, 100);
  }

  float score = tempScore * 0.30 + vibScore * 0.30 + curScore * 0.25 + volScore * 0.15;
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

void showDisplay(float temperature, float vibration, float current, float voltage,
                 int score, const char* status, unsigned long runtime) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("MACHINE HEALTH MONITOR");
  display.printf("Temp : %.1f C\n", temperature);
  display.printf("Vib  : %.0f\n", vibration);
  display.printf("Cur  : %.2f A\n", current);
  display.printf("Volt : %.1f V\n", voltage);
  display.printf("Score: %d%% %s\n", score, status);
  display.printf("Run  : %lu min\n", runtime / 60000);
  display.printf("Relay: %s\n", relayOn ? "ON" : "OFF");
  display.display();
}

String createPayload(float temperature, float vibration, float current, float voltage,
                     int score, const char* status, unsigned long runtime) {
  JsonDocument doc;
  doc["deviceId"] = "MACHINE_01";
  doc["moduleType"] = "machine-health";
  doc["temperature"] = temperature;
  doc["vibration"] = vibration;
  doc["current"] = current;
  doc["voltage"] = voltage;
  doc["machineRuntime"] = runtime / 1000;
  doc["healthScore"] = score;
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
  pinMode(VIBRATION_PIN, INPUT);
  pinMode(CURRENT_PIN, INPUT);
  pinMode(VOLTAGE_PIN, INPUT);
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
  display.println("Machine Health Booting...");
  display.display();
  machineStartTime = millis();
  connectWiFi();
}

void loop() {
  float temperature = dht.readTemperature();
  if (isnan(temperature)) {
    Serial.println("DHT22 read error");
    delay(1000);
    return;
  }

  float vibrationRaw = analogRead(VIBRATION_PIN);
  float current = analogRead(CURRENT_PIN) * 10.0 / 4095.0;
  float voltage = analogRead(VOLTAGE_PIN) * 300.0 / 4095.0;

  bool criticalFault = temperature > TEMP_CRITICAL || vibrationRaw > VIBRATION_CRITICAL || current > CURRENT_CRITICAL;
  relayOn = !criticalFault;
  digitalWrite(RELAY_PIN, relayOn ? HIGH : LOW);

  int score = calculateHealthScore(temperature, vibrationRaw, current, voltage);
  const char* status = statusFromScore(score);
  unsigned long runtime = millis() - machineStartTime;

  setIndicators(score, criticalFault);
  showDisplay(temperature, vibrationRaw, current, voltage, score, status, runtime);

  if (millis() - lastSentAt >= SEND_INTERVAL_MS) {
    lastSentAt = millis();
    String payload = createPayload(temperature, vibrationRaw, current, voltage, score, status, runtime);
    sendToBackend(payload);
  }
  delay(1000);
}
