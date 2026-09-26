# ESP32 Motor Protection System - Firmware & API Integration Guide

Hi! This directory contains the complete ESP32 source code and guide to transmit real-time motor sensor telemetry to your Node.js / Express backend API (`/api/sensor-data`).

---

## 🚀 Key Features

1. **Real-time Telemetry POST**: Automatically packages Temperature, Voltage, Current, Motor Status, and Fault status into JSON format and posts it to the backend API via Wi-Fi.
2. **Built-in Motor Protection Logic**:
   - **Overheat Protection** (> 65°C) -> Trips relay (`motorStatus: OFF`, `fault: OVERHEAT`)
   - **Over-voltage Protection** (> 260V) -> Trips relay (`motorStatus: OFF`, `fault: OVERVOLTAGE`)
   - **Under-voltage Protection** (< 180V) -> Trips relay (`motorStatus: OFF`, `fault: UNDERVOLTAGE`)
   - **Over-current Protection** (> 10A) -> Trips relay (`motorStatus: OFF`, `fault: OVERCURRENT`)
3. **Dual Mode (Simulation & Physical Sensors)**:
   - `#define USE_SIMULATED_SENSORS true` allows you to test sending data to the backend API **immediately** without waiting for physical wiring.
   - Set to `false` when using physical sensors (LM35/DS18B20, ZMPT101B, ACS712).

---

## 🔌 Circuit Pin Diagram

| ESP32 Pin | Connected Component | Description |
|-----------|--------------------|-------------|
| **GPIO 34** | LM35 / Temp Sensor (ADC) | Temperature Measurement |
| **GPIO 35** | ZMPT101B / Volt Sensor (ADC) | AC Voltage Measurement |
| **GPIO 32** | ACS712 / Current Sensor (ADC) | Current Measurement |
| **GPIO 26** | Relay Module IN | Motor Contactor / Relay Control |
| **GPIO 27** | LED / Buzzer (+) | Fault Alarm Indicator |
| **3.3V / 5V** | VCC | Sensor & Relay Power |
| **GND** | GND | Common Ground |

---

## ⚙️ How to Setup & Flash

### Step 1: Open Code in Arduino IDE or PlatformIO
- **Arduino IDE**: Open `esp32_motor_protection.ino`. Make sure you install the `ArduinoJson` library from Library Manager (*Tools -> Manage Libraries -> Search "ArduinoJson"*).
- **PlatformIO**: Open the `esp32/` directory in VS Code with PlatformIO extension installed.

### Step 2: Configure Wi-Fi & Backend Server IP
In `esp32_motor_protection.ino`, update lines 18–23:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";       // Your WiFi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Your WiFi Password

// IMPORTANT: Replace 192.168.1.100 with your computer's local IP address (run ipconfig on Windows)
const char* API_URL = "http://192.168.1.100:5000/api/sensor-data";
```

> ⚠️ **Note**: Do **NOT** use `http://localhost:5000` because `localhost` inside ESP32 points to ESP32 itself! Use your PC's local Wi-Fi IP (e.g. `192.168.1.X` or `192.168.43.X`).

### Step 3: Flash to ESP32 Board
- Connect your ESP32 board via USB.
- Select your board (**ESP32 Dev Module**) and Port.
- Click **Upload**.
- Open Serial Monitor at **115200 Baud Rate** to watch live Wi-Fi connection and API POST requests!

---

## 🧪 Testing API Data Flow

1. Start your backend server:
   ```bash
   cd server
   npm run dev
   ```
2. Run the included simulator (optional):
   ```bash
   node server/esp32_simulator.js
   ```
3. Watch MongoDB populate with live motor telemetry!
