#include <ArduinoJson.h>

// project variables
int d2Val = 0;
int d3Val = 0;
int d2ClickCount = 0;
int d3ClickCount = 0;

int prevD2Val = 0;
int prevD3Val = 0;

void sendData() {
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject D2 = data.createNestedObject("D2");
  JsonObject D3 = data.createNestedObject("D3");

  D2["isPressed"] = d2Val;
  D3["isPressed"] = d3Val;
  D2["count"] = d2ClickCount;
  D3["count"] = d3ClickCount;

  String resTxt = "";
  serializeJson(resJson, resTxt);

  Serial.println(resTxt);
}

void setup() {
  // Serial setup
  Serial.begin(9600);
  while (!Serial) {}
}

void loop() {
  // read pins
  d2Val = digitalRead(2);
  d3Val = digitalRead(3);

  // calculate if d2 was clicked
  if (d2Val && d2Val != prevD2Val) {
    d2ClickCount++;
  }

   if (d3Val && d3Val != prevD3Val) {
    d3ClickCount++;
  }

  prevD2Val = d2Val;
  prevD3Val = d3Val;

  // Serial.println(String(d2Val) + " " + d3Val);
  // check if there was a request for data, and if so, send new data
  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) {
      Serial.flush();
      sendData();
    }
  }

  delay(2);
}
