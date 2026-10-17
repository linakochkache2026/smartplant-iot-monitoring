#include <WiFi.h>
#include <HTTPClient.h>
#include <DHTesp.h>

const int SOIL_PIN = 34;
const int DHT_PIN = 15;
const int PUMP_PIN = 26;

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Remplacer par la clé Write API de ton canal ThingSpeak.
// Ne publie jamais une vraie clé dans un dépôt public.

const char* API_KEY = "YOUR_WRITE_API_KEY";
DHTesp dht;
bool pumpOn = false;

unsigned long lastRead = 0;
unsigned long lastUpload = 0;

const int DRY_THRESHOLD = 30;
const int WET_THRESHOLD = 40;

int readSoilMoisture() {
  int raw = analogRead(SOIL_PIN);
  return constrain(map(raw, 0, 4095, 0, 100), 0, 100);
}

void setup() {
  Serial.begin(115200);

  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  analogReadResolution(12);

  dht.setup(DHT_PIN, DHTesp::DHT22);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected!");
}

void loop() {
  unsigned long now = millis();

  if (now - lastRead < 2000 && lastRead != 0) {
    delay(20);
    return;
  }

  lastRead = now;

  int soil = readSoilMoisture();
  TempAndHumidity air = dht.getTempAndHumidity();

  if (isnan(air.temperature) || isnan(air.humidity)) {
    Serial.println("DHT22 reading error");
    return;
  }

  // Automatic irrigation with two thresholds.
  if (!pumpOn && soil < DRY_THRESHOLD) {
    pumpOn = true;
  } else if (pumpOn && soil >= WET_THRESHOLD) {
    pumpOn = false;
  }

  digitalWrite(PUMP_PIN, pumpOn ? HIGH : LOW);

  Serial.println("\n--- SmartPlant ---");
  Serial.printf("Soil moisture: %d%%\n", soil);
  Serial.printf("Temperature: %.1f C\n", air.temperature);
  Serial.printf("Air humidity: %.1f%%\n", air.humidity);
  Serial.printf("Pump indicator: %s\n", pumpOn ? "ON" : "OFF");

  if (now - lastUpload >= 20000 || lastUpload == 0) {
    lastUpload = now;

    if (String(API_KEY) != "YOUR_WRITE_API_KEY"
        && WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      String url = "http://api.thingspeak.com/update";
      http.begin(url);
      http.addHeader("Content-Type",
                     "application/x-www-form-urlencoded");

      String body = "api_key=" + String(API_KEY)
                  + "&field1=" + String(soil)
                  + "&field2=" + String(air.temperature, 1)
                  + "&field3=" + String(air.humidity, 1)
                  + "&field4=" + String(pumpOn ? 1 : 0);

      int response = http.POST(body);

      Serial.printf("ThingSpeak HTTP response: %d\n", response);

      http.end();
    } else {
      Serial.println("Cloud upload skipped: configure API key.");
    }
  }
}
