#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ---------- OLED ----------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// ---------- WiFi ----------
const char* ssid = "JINAY MEVADA";
const char* password = "9510106940";

void setup() {

  Serial.begin(115200);

  // OLED I2C
  Wire.begin(21, 22);

  // Start OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("OLED not found!");

    while (true) {
      delay(1000);
    }
  }

  // Show starting message
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println("ESP32");

  display.setTextSize(1);
  display.setCursor(0, 30);
  display.println("Connecting WiFi...");

  display.display();

  // Connect WiFi
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");

  int count = 0;

  while (WiFi.status() != WL_CONNECTED && count < 30) {

    delay(500);
    Serial.print(".");

    count++;
  }

  // ---------- WiFi Connected ----------
  if (WiFi.status() == WL_CONNECTED) {

    Serial.println();
    Serial.println("WiFi Connected!");

    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    display.clearDisplay();

    display.setTextSize(2);
    display.setCursor(0, 0);
    display.println("WiFi OK");

    display.setTextSize(1);
    display.setCursor(0, 28);
    display.println("FUTUREBEATS!");

    display.setCursor(0, 42);
    display.print("IP:");

    display.setCursor(20, 42);
    display.println(WiFi.localIP());

    display.display();
  }

  // ---------- WiFi Failed ----------
  else {

    Serial.println();
    Serial.println("WiFi Connection Failed!");

    display.clearDisplay();

    display.setTextSize(2);
    display.setCursor(0, 0);
    display.println("WiFi");

    display.setCursor(0, 25);
    display.println("FAILED");

    display.setTextSize(1);
    display.setCursor(0, 48);
    display.println("Check SSID/Password");

    display.display();
  }
}

void loop() {

}