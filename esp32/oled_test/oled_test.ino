/*
 * ====================================================================================
 * ESP32 OLED Display (SSD1306 128x64 I2C) Test Sketch
 * ====================================================================================
 * Connections:
 *   ESP32 GND    -> OLED GND
 *   ESP32 3.3V   -> OLED VCC (or 5V if 5V tolerant)
 *   ESP32 GPIO21 -> OLED SDA
 *   ESP32 GPIO22 -> OLED SCL
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

int counter = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- ESP32 OLED SSD1306 Test ---");

  // I2C Pins: SDA = GPIO 21, SCL = GPIO 22
  Wire.begin(21, 22);

  // Attempt connection on 0x3C, fallback to 0x3D
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ OLED not found at 0x3C! Trying address 0x3D...");
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
      Serial.println("❌ SSD1306 allocation failed. Check wiring (SDA->21, SCL->22, VCC, GND)!");
      while (true) {
        delay(1000);
      }
    }
  }

  Serial.println("✅ OLED Display initialized successfully!");

  // Welcome Screen
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(18, 10);
  display.println("IOT MOTOR SYSTEM");
  display.drawFastHLine(0, 24, 128, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(20, 34);
  display.println("OLED OK!");
  display.display();
  delay(2500);
}

void loop() {
  display.clearDisplay();

  // Top Title Bar
  display.fillRect(0, 0, 128, 12, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(8, 2);
  display.print("MOTOR PROTECTION");

  // Telemetry Metrics
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  // Line 1: Voltage
  display.setCursor(4, 18);
  display.print("VOLT: ");
  display.print(228 + (counter % 5));
  display.print(" V");

  // Line 2: Current
  display.setCursor(4, 30);
  display.print("CURR: ");
  display.print(4.2 + ((counter % 3) * 0.1), 1);
  display.print(" A");

  // Line 3: Temperature
  display.setCursor(4, 42);
  display.print("TEMP: ");
  display.print(38 + (counter % 4));
  display.print(" C");

  // Bottom Status Bar
  display.drawRect(0, 53, 128, 11, SSD1306_WHITE);
  display.setCursor(4, 55);
  display.print("STATUS: RUNNING");

  // Animated live tick indicator (blinking square)
  if (counter % 2 == 0) {
    display.fillRect(118, 55, 6, 6, SSD1306_WHITE);
  }

  display.display();

  Serial.print("OLED updated. Cycle count: ");
  Serial.println(counter);

  counter++;
  delay(1000);
}
