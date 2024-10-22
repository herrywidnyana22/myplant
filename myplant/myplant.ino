#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char *ssid = "GUDANG POJOK";
const char *password = "gudang_pojok629";

// MQTT credentials
const char *mqtt_broker = "u67e3c9f.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883;  // MQTT over TLS
const char *mqtt_username = "myplant";
const char *mqtt_password = "myplant12345";

// topics
const char *mqtt_topic_control = "myplant/control"; //topic for control relay
const char *mqtt_topic_web = "myplant/web"; // topic for web commands
const char *mqtt_topic_status = "myplant/status"; //topic for relay status
const char *mqtt_topic_runtime = "myplant/runtime"; //topic for relay runtime

// Pin assignments for relays
const int relayPins[5] = {D1, D2, D3, D4, D5};

// Relay states and runtimes
bool relayState[5] = {false, false, false, false, false};
unsigned long relayRuntime[5] = {0, 0, 0, 0, 0};
unsigned long lastMillis[5] = {0, 0, 0, 0, 0};
unsigned long previousUpdateMillis = 0; 

WiFiClientSecure espClient;
PubSubClient mqtt_client(espClient);

// Function prototypes
void connectToWiFi();
void connectToMQTTBroker();
void mqttCallback(char *topic, byte *payload, unsigned int length);
void controlRelay(int relayID, bool state);
void publishRelayStatus();
void publishRelayRuntime();

void setup() {
  Serial.begin(9600);
  
  // Disable certificate validation for testing purposes
  espClient.setInsecure();

  // Setup relay pins as OUTPUT
  for (int i = 0; i < 5; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH);  // Initial state of relays (HIGH = OFF)
  }

  connectToWiFi();
  mqtt_client.setServer(mqtt_broker, mqtt_port);
  mqtt_client.setCallback(mqttCallback);
  connectToMQTTBroker();

  // Publish the current status and runtime on startup
  publishRelayStatus();
  publishRelayRuntime();
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
    Serial.printf("Connecting to MQTT Broker as %s...\n", client_id.c_str());

    if (mqtt_client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
 
      mqtt_client.subscribe(mqtt_topic_control);  // Subscribe to control topic
      mqtt_client.subscribe(mqtt_topic_web);      // Subscribe to the new web topic

    } else {
      Serial.print("Failed to connect to MQTT broker, rc=");
      Serial.print(mqtt_client.state());
      Serial.println(". Trying again in 5 seconds...");
      delay(5000);
    }
  }
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
  Serial.print("Message: ");

  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println(message);
  Serial.println("-----------------------");
  // Parse the message to control the relays

  if (String(topic) == mqtt_topic_web) {
    if (message == "init") {
      publishRelayStatus();
      publishRelayRuntime();
    }
  } 

  else if (String(topic) == mqtt_topic_control) {
    int delimiterIndex = message.indexOf(':');
    if (delimiterIndex > 0) {
      String relayIDString = message.substring(0, delimiterIndex);
      String command = message.substring(delimiterIndex + 1);

      // Convert relay ID from string to integer
      int relayID = relayIDString.substring(5).toInt();  // Extract number from "keranX"

      if (relayID >= 1 && relayID <= 5) {
          // Trim command to remove any leading/trailing whitespace
          command.trim();

          if (command.equalsIgnoreCase("ON")) {
              controlRelay(relayID, true); // Turn ON relay
          } else if (command.equalsIgnoreCase("OFF")) {
              controlRelay(relayID, false); // Turn OFF relay
          } else {
              Serial.println("Invalid command; expected ON or OFF");
          }
      } else {
          Serial.println("Invalid relay ID");
      }
    }
  }

}

void controlRelay(int relayID, bool state) {
    int index = relayID - 1; // Convert to zero-based index
    digitalWrite(relayPins[index], state ? LOW : HIGH); // LOW = ON, HIGH = OFF
    relayState[index] = state; // Update relay state
    Serial.printf("Relay %d %s\n", relayID, state ? "ON" : "OFF");

    // Reset the runtime if the relay is turned OFF
    if (!state) {
        relayRuntime[index] = 0; // Reset runtime to 0
    }

    mqtt_client.publish(mqtt_topic_status, String("Keran " + String(relayID) + ": " + (state ? "ON" : "OFF")).c_str());
}

void publishRelayStatus() {
  // Create a JSON array
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < 5; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["name"] = "keran" + String(i + 1);
    obj["status"] = relayState[i] ? "ON" : "OFF";
  }

  char buffer[256];
  serializeJson(arr, buffer, sizeof(buffer));

  // Print the JSON being published
  Serial.print("Publishing message: ");
  Serial.println(buffer);

  // Publish the JSON string to the MQTT topic
  if (mqtt_client.publish(mqtt_topic_status, buffer)) {
    Serial.println("Message published successfully.");
  } else {
    Serial.println("Failed to publish message.");
  }
}

void publishRelayRuntime() {
  // Create a JSON array for runtimes
  StaticJsonDocument<256> doc;
  JsonArray arr = doc.to<JsonArray>();

  for (int i = 0; i < 5; i++) {
    JsonObject obj = arr.createNestedObject();
    obj["name"] = "keran" + String(i + 1);
    obj["runtime"] = relayRuntime[i];
  }

  char buffer[256];
  serializeJson(arr, buffer, sizeof(buffer));

  // Print the JSON being published
  Serial.print("Publishing message: ");
  Serial.println(buffer);

  // Publish the JSON string to the MQTT topic
  if (mqtt_client.publish(mqtt_topic_runtime, buffer)) {
    Serial.println("Message published successfully.");
  } else {
    Serial.println("Failed to publish message.");
  }
}

void loop() {
  if (!mqtt_client.connected()) {
    connectToMQTTBroker();
  }
  mqtt_client.loop();

  // Update relay runtimes
  for (int i = 0; i < 5; i++) {
    if (relayState[i]) {
      relayRuntime[i] += millis() - lastMillis[i];  // Increment runtime
      lastMillis[i] = millis();  // Update lastMillis to current time
    } else {
      lastMillis[i] = millis();  // Reset lastMillis if the relay is off
    }
  }
}