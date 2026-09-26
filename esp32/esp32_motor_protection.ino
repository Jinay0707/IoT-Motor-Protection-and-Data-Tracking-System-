/*
 * ====================================================================================
 * IoT Motor Protection System - ESP32 Firmware Sketch
 * ====================================================================================
 * Description: Reads sensor data (Temperature, Voltage, Current), detects fault conditions,
 *              controls the Motor Relay, and sends real-time data to backend API.
 * ====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ====================================================================================
// 1. Wi-Fi & Server Configurations
// ====================================================================================
// Replace with your Wi-Fi SSID and Password
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your Laptop/Server Local IP Address (e.g., http://192.168.1.100:5000/api/sensor-data)
// Note: Do NOT use "localhost" or "127.0.0.1" here because ESP32 is on its own IP.
const char* API_URL = "http://192.168.1.100:5000/api/sensor-data";

// Data transmission interval (milliseconds)
const unsigned long TRANSMISSION_INTERVAL = 5000; // Send data every 5 seconds
unsigned long lastTransmissionTime = 0;

// ====================================================================================
// 2. Hardware Pin Setup & Protection Thresholds
// ====================================================================================
// Mode Toggle: Set to 'true' for testing API without physical sensors attached.
// Set to 'false' when physical sensors (LM35/DS18B20, ZMPT101B, ACS712) are wired.
#define USE_SIMULATED_SENSORS true

// Hardware Pins (Adjust as per your ESP32 circuit wiring)
const int PIN_TEMP_SENSOR    = 34; // ADC pin for LM35 / Analog Temp Sensor
const int PIN_VOLT_SENSOR    = 35; // ADC pin for Voltage Sensor (ZMPT101B / Divider)
const int PIN_CURR_SENSOR    = 32; // ADC pin for Current Sensor (ACS712)
const int PIN_RELAY          = 26; // Digital output pin for Motor Relay Contactor
const int PIN_LED_FAULT      = 27; // Digital output pin for Fault Indicator LED/Buzzer

// Safety Threshold Limits for Motor Protection
const float THRESHOLD_MAX_TEMP  = 65.0; // Max Temperature in °C
const float THRESHOLD_MAX_VOLT  = 260.0; // Max Voltage in Volts (Over-voltage)
const float THRESHOLD_MIN_VOLT  = 180.0; // Min Voltage in Volts (Under-voltage)
const float THRESHOLD_MAX_CURR  = 10.0;  // Max Current in Amps (Over-current)

// ====================================================================================
// 3. Helper Functions - Sensor Reading & Protection Logic
// ====================================================================================

// Function to read Temperature (°C)
float readTemperature() {
#if USE_SIMULATED_SENSORS
  // Returns realistic random temperature between 35.0°C and 48.0°C
  return 35.0 + random(0, 130) / 10.0;
#else
  int rawADC = analogRead(PIN_TEMP_SENSOR);
  // LM35 Formula: (ADC_Value / 4095.0) * 3300mV / 10mV/°C
  float milliVolts = (rawADC / 4095.0) * 3300.0;
  float tempC = milliVolts / 10.0;
  return tempC;
#endif
}

// Function to read Voltage (V)
float readVoltage() {
#if USE_SIMULATED_SENSORS
  // Returns realistic random voltage around 230V (220V - 240V)
  return 220.0 + random(0, 200) / 10.0;
#else
  int rawADC = analogRead(PIN_VOLT_SENSOR);
  // Calibration multiplier depending on ZMPT101B / Divider circuit
  float voltage = (rawADC / 4095.0) * 300.0; 
  return voltage;
#endif
}

// Function to read Current (A)
float readCurrent() {
#if USE_SIMULATED_SENSORS
  // Returns realistic random current between 2.5A and 4.8A
  return 2.5 + random(0, 23) / 10.0;
#else
  int rawADC = analogRead(PIN_CURR_SENSOR);
  // ACS712 20A Model: Sensitivity 100mV/A, Vref = 1.65V (for 3.3V ADC)
  float voltage = (rawADC / 4095.0) * 3.3;
  float current = abs((voltage - 1.65) / 0.100); 
  return current;
#endif
}

// Evaluate Fault condition based on safety thresholds
String evaluateFault(float temp, float volt, float curr) {
  if (temp > THRESHOLD_MAX_TEMP) {
    return "OVERHEAT";
  }
  if (volt > THRESHOLD_MAX_VOLT) {
    return "OVERVOLTAGE";
  }
  if (volt < THRESHOLD_MIN_VOLT) {
    return "UNDERVOLTAGE";
  }
  if (curr > THRESHOLD_MAX_CURR) {
    return "OVERCURRENT";
  }
  return "NORMAL";
}

// Send JSON Payload to API Server
void sendDataToAPI(float temp, float volt, float curr, String motorStatus, String fault) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi Disconnected! Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  
  // Begin HTTP Connection
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Document using ArduinoJson
  StaticJsonDocument<256> doc;
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

  // Send HTTP POST
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.print("✅ Server Response Code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.print("📩 Server Response: ");
    Serial.println(response);
  } else {
    Serial.print("❌ HTTP POST Failed, Error Code: ");
    Serial.println(httpResponseCode);
    Serial.print("❌ Error Detail: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
  }

  http.end(); // Free resources
  Serial.println("------------------------------------------------\n");
}

// ====================================================================================
// 4. Arduino Setup Function
// ====================================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==============================================");
  Serial.println("⚙️  ESP32 Motor Protection System Starting...");
  Serial.println("==============================================");

  // Configure Hardware Pins
  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_LED_FAULT, OUTPUT);

  // Initial State: Motor ON, Fault LED OFF
  digitalWrite(PIN_RELAY, HIGH);  // HIGH = Motor Relay ON
  digitalWrite(PIN_LED_FAULT, LOW);

  // Connect to Wi-Fi
  Serial.print("📡 Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED && attempt < 30) {
    delay(500);
    Serial.print(".");
    attempt++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected Successfully!");
    Serial.print("🌐 ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n⚠️ Wi-Fi Connection Failed! Will attempt reconnect in main loop.");
  }
}

// ====================================================================================
// 5. Arduino Main Loop Function
// ====================================================================================
void loop() {
  unsigned long currentMillis = millis();

  // Execute transmission at specified interval
  if (currentMillis - lastTransmissionTime >= TRANSMISSION_INTERVAL) {
    lastTransmissionTime = currentMillis;

    // 1. Read Sensor Values
    float temp = readTemperature();
    float volt = readVoltage();
    float curr = readCurrent();

    // 2. Evaluate Motor Protection & Fault Status
    String fault = evaluateFault(temp, volt, curr);
    String motorStatus = "ON";

    // Protection Action: Trip Relay if fault detected
    if (fault != "NORMAL") {
      motorStatus = "OFF";
      digitalWrite(PIN_RELAY, LOW);     // Trip Relay -> Turn Off Motor
      digitalWrite(PIN_LED_FAULT, HIGH); // Turn On Fault LED
      Serial.print("🚨 FAULT DETECTED: ");
      Serial.print(fault);
      Serial.println(" -> Motor Tripped OFF!");
    } else {
      digitalWrite(PIN_RELAY, HIGH);    // Relay ON -> Motor Running Normal
      digitalWrite(PIN_LED_FAULT, LOW);
    }

    // Print Local Serial Logs
    Serial.printf("📊 Readings -> Temp: %.1f°C | Volt: %.1fV | Curr: %.2fA | Motor: %s | Fault: %s\n",
                  temp, volt, curr, motorStatus.c_str(), fault.c_str());

    // 3. Send Telemetry to API
    sendDataToAPI(temp, volt, curr, motorStatus, fault);
  }
}
