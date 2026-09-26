/*
 * ====================================================================================
 * IoT Motor Protection System - Wokwi & Physical ESP32 Firmware
 * ====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials (Default for Wokwi)
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// ⚠️ REPLACE WITH YOUR LOCALTUNNEL / SERVER URL (e.g., https://your-link.loca.lt/api/sensor-data)
const char* API_URL = "http://localhost:5000/api/sensor-data";

const unsigned long TRANSMISSION_INTERVAL = 4000;
unsigned long lastTransmissionTime = 0;

const int PIN_TEMP_SENSOR = 34;
const int PIN_VOLT_SENSOR = 35;
const int PIN_CURR_SENSOR = 32;
const int PIN_RELAY       = 26;
const int PIN_LED_FAULT   = 27;

const float THRESHOLD_MAX_TEMP = 65.0;
const float THRESHOLD_MAX_VOLT = 260.0;
const float THRESHOLD_MIN_VOLT = 180.0;
const float THRESHOLD_MAX_CURR = 10.0;

String remoteCommandState = "AUTO";

float readTemperature() {
  int rawADC = analogRead(PIN_TEMP_SENSOR);
  return 20.0 + (rawADC / 4095.0) * 70.0;
}

float readVoltage() {
  int rawADC = analogRead(PIN_VOLT_SENSOR);
  return 150.0 + (rawADC / 4095.0) * 150.0;
}

float readCurrent() {
  int rawADC = analogRead(PIN_CURR_SENSOR);
  return (rawADC / 4095.0) * 15.0;
}

String evaluateFault(float temp, float volt, float curr) {
  if (temp > THRESHOLD_MAX_TEMP) return "OVERHEAT";
  if (volt > THRESHOLD_MAX_VOLT) return "OVERVOLTAGE";
  if (volt < THRESHOLD_MIN_VOLT) return "UNDERVOLTAGE";
  if (curr > THRESHOLD_MAX_CURR) return "OVERCURRENT";
  return "NORMAL";
}

void sendDataToAPI(float temp, float volt, float curr, String motorStatus, String fault) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi Disconnected! Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["temperature"] = temp;
  doc["voltage"]     = volt;
  doc["current"]     = curr;
  doc["motorStatus"] = motorStatus;
  doc["fault"]       = fault;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.println("\n------------------------------------------------");
  Serial.print("📤 Sending POST to API: ");
  Serial.println(API_URL);
  Serial.print("📦 Payload: ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("✅ Server Response Code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("📩 Server Response: ");
    Serial.println(response);

    JsonDocument responseDoc;
    DeserializationError err = deserializeJson(responseDoc, response);
    if (!err && responseDoc.containsKey("command")) {
      remoteCommandState = responseDoc["command"].as<String>();
      Serial.print("🕹️ Server Control Command: ");
      Serial.println(remoteCommandState);
    }
  } else {
    Serial.print("❌ HTTP POST Failed, Error Code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
  Serial.println("------------------------------------------------\n");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==============================================");
  Serial.println("⚙️  ESP32 Motor Protection System");
  Serial.println("==============================================");

  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED_FAULT, OUTPUT);

  digitalWrite(PIN_RELAY, HIGH);
  digitalWrite(PIN_LED_FAULT, LOW);

  Serial.print("📡 Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("🌐 ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTransmissionTime >= TRANSMISSION_INTERVAL) {
    lastTransmissionTime = currentMillis;

    float temp = readTemperature();
    float volt = readVoltage();
    float curr = readCurrent();

    String fault = evaluateFault(temp, volt, curr);
    String motorStatus = "ON";

    if (remoteCommandState == "OFF") {
      motorStatus = "OFF";
      digitalWrite(PIN_RELAY, LOW);
      digitalWrite(PIN_LED_FAULT, HIGH);
      Serial.println("🛑 REMOTE COMMAND: FORCE STOP MOTOR (RELAY OFF)");
    } else if (remoteCommandState == "ON") {
      motorStatus = "ON";
      digitalWrite(PIN_RELAY, HIGH);
      digitalWrite(PIN_LED_FAULT, LOW);
      Serial.println("🟢 REMOTE COMMAND: FORCE START MOTOR (RELAY ON)");
    } else {
      if (fault != "NORMAL") {
        motorStatus = "OFF";
        digitalWrite(PIN_RELAY, LOW);
        digitalWrite(PIN_LED_FAULT, HIGH);
        Serial.printf("🚨 AUTO FAULT [%s] -> RELAY OFF\n", fault.c_str());
      } else {
        motorStatus = "ON";
        digitalWrite(PIN_RELAY, HIGH);
        digitalWrite(PIN_LED_FAULT, LOW);
      }
    }

    Serial.printf("📊 Readings -> Temp: %.1f°C | Volt: %.1fV | Curr: %.2fA | Motor: %s | Fault: %s\n",
                  temp, volt, curr, motorStatus.c_str(), fault.c_str());

    sendDataToAPI(temp, volt, curr, motorStatus, fault);
  }
}
