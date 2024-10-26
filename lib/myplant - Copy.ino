#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi and MQTT credentials
const char *ssid = "MyHOT";
const char *password = "HotBanget*123#";
const char *mqtt_broker = "u67e3c9f.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883;  // MQTT over TLS
const char *mqtt_username = "myplant";
const char *mqtt_password = "myplant12345";

// MQTT topics
const char *mqtt_topic_control = "myplant/control";
const char *mqtt_topic_web = "myplant/web";
const char *mqtt_topic_status = "myplant/status";
const char *mqtt_topic_duration = "myplant/duration";
const char *mqtt_topic_runtime = "myplant/runtime";

// Pin assignments for relays
const int relayPins[5] = {D1, D2, D3, D4, D5};

// Relay states and runtimes
String relayState[5] = {"OFF", "OFF", "OFF", "OFF", "OFF"};  //value "OFF", "RUNNING", "PAUSED"
unsigned long relayDuration[5] = {0, 0, 0, 0, 0}; // setup relay duration
unsigned long relayRuntime[5] = {0, 0, 0, 0, 0}; // runtime relay
unsigned long lastMillis[5] = {0, 0, 0, 0, 0};

WiFiClientSecure espClient;
PubSubClient mqtt_client(espClient);

// Function prototypes
void connectToWiFi();
void connectToMQTTBroker();
void mqttCallback(char *topic, byte *payload, unsigned int length);
void controlRelay(int relayID, String command, int duration);
void publishRelayStatus();
void publishRelayDuration();
void publishRelayRuntime();
void initState();

void setup() {
  Serial.begin(9600);
  espClient.setInsecure();

  for (int i = 0; i < 5; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH);  // Initial state (HIGH = OFF)
  }

  connectToWiFi();
  mqtt_client.setServer(mqtt_broker, mqtt_port);
  mqtt_client.setCallback(mqttCallback);
  connectToMQTTBroker();

  initState();
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void connectToMQTTBroker() {
  while (!mqtt_client.connected()) {
    String client_id = "esp8266-client-" + String(WiFi.macAddress());
    if (mqtt_client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
      mqtt_client.subscribe(mqtt_topic_control);
      mqtt_client.subscribe(mqtt_topic_web);
      Serial.println("Connected to MQTT Broker");
    } else {
      Serial.println("Failed to connect to MQTT broker. Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("Message received:");
  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Payload: ");
  Serial.println(message);

  if (String(topic) == mqtt_topic_web) {
    if (message == "init") {
      initState();
    }
  } else if (String(topic) == mqtt_topic_control) {
    processMessage(message);
  }
}

void processMessage(String message) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.f_str());
    return;
  }

  int keranID = doc["keranID"];
  String status = doc["status"];  // "RUNNING", "PAUSED", "OFF" or "PLAY"
  int duration = doc["duration"] | 0;

  if (keranID < 0 || keranID >= 5) {
    Serial.println("Invalid keranID");
    return;
  }

  controlRelay(keranID, status, duration);
}

// Control the relay
void controlRelay(int relayID, String command, int duration) {
    if (relayID < 0 || relayID >= 5) {
        Serial.println("Invalid relay index.");
        return;
    }

    Serial.printf("Control command for relay %d: %s\n", relayID + 1, command.c_str());

    if (command == "RUNNING") {
        digitalWrite(relayPins[relayID], LOW); // LOW = ON
        if (relayState[relayID] != "RUNNING") {
            relayState[relayID] = "RUNNING";
            lastMillis[relayID] = millis() - relayRuntime[relayID]; // Resume from where it left off
        }

        relayDuration[relayID] = duration == 0 ? 0 : duration * 60000UL; // Convert to ms if not indefinite
        Serial.printf("Relay %d set to RUNNING with duration %d ms\n", relayID + 1, relayDuration[relayID]);

    } else if (command == "PAUSED") {
        digitalWrite(relayPins[relayID], HIGH);
        if (relayState[relayID] == "RUNNING") {
            relayState[relayID] = "PAUSED";
            relayRuntime[relayID] = millis() - lastMillis[relayID]; // Capture runtime at pause
        }
        Serial.printf("Relay %d paused\n", relayID + 1);

    } else if (command == "OFF") {
        digitalWrite(relayPins[relayID], HIGH); // Turn OFF
        relayState[relayID] = "OFF";
        relayRuntime[relayID] = 0; // Reset runtime
        relayDuration[relayID] = 0;
        lastMillis[relayID] = millis(); // Reset start time
        Serial.printf("Relay %d turned OFF\n", relayID + 1);
    }

    initState();
}

void publishRelayStatus() {
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < 5; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["name"] = "keran" + String(i + 1);
    obj["status"] = relayState[i];
  }

  char buffer[256];
  serializeJson(arr, buffer, sizeof(buffer));
  mqtt_client.publish(mqtt_topic_status, buffer);

  Serial.println("Published relay status to topic: myplant/status");
  Serial.print("Status: ");
  Serial.println(buffer);
}

void publishRelayDuration() {
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < 5; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["name"] = "keran" + String(i + 1);
    obj["duration"] = relayDuration[i] / 60000; // covert back to minutes
  }

  char buffer[256];
  serializeJson(arr, buffer, sizeof(buffer));
  mqtt_client.publish(mqtt_topic_duration, buffer);

  Serial.println("Published relay duration to topic: myplant/duration");
  Serial.print("Duration: ");
  Serial.println(buffer);
}

void publishRelayRuntime() {
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < 5; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["name"] = "keran" + String(i + 1);
    obj["runtime"] = relayRuntime[i];
  }

  char buffer[256];
  serializeJson(arr, buffer, sizeof(buffer));
  mqtt_client.publish(mqtt_topic_runtime, buffer);

  Serial.println("Published relay runtime to topic: myplant/runtime");
  Serial.print("Runtime: ");
  Serial.println(buffer);
}

void initState(){
  publishRelayStatus();
  publishRelayDuration();
  publishRelayRuntime();
}

void loop() {
    if (!mqtt_client.connected()) {
        connectToMQTTBroker();
    }
    mqtt_client.loop();

    for (int i = 0; i < 5; i++) {
        if (relayState[i] == "RUNNING") {
            relayRuntime[i] = millis() - lastMillis[i];

            if (relayDuration[i] != 0 && relayRuntime[i] >= relayDuration[i]) {
                controlRelay(i, "OFF", 0); // Turn OFF relay after duration
                Serial.printf("Relay %d automatically turned OFF after duration\n", i + 1);
            }

        } else if (relayState[i] == "PAUSED") {
            // relayRuntime remains constant in PAUSED state, no updates required

        } else if (relayState[i] == "OFF") {
            // relayRuntime and lastMillis are reset in the OFF state, no further updates required
        }
    }
}
