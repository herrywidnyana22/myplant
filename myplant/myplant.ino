#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <vector>
#include <TimeLib.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <HTTPClient.h>

// WiFi and MQTT credentials
// const char *ssid = "GUDANG POJOK";
// const char *password = "gudang_pojok629";
// const char *ssid = "TP-Link_0BA8";
// const char *password = "16275676";
const char *ssid = "HAI";
const char *password = "wifi*123#";
const char *mqtt_broker = "u67e3c9f.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883;
const char *mqtt_username = "myplant";
const char *mqtt_password = "myplant12345";

// MQTT topics
const char *mqtt_topic_control = "myplant/control";          // for control spesific keran
const char *mqtt_topic_bulk_control = "myplant/bulkcontrol"; // for bulkcontrol keran
const char *mqtt_topic_device_connected = "myplant/device/connected";  // initial for online | offline this device, only publish when device online
const char *mqtt_topic_web_connected= "myplant/web/connected";     // initial for online | offline web clinet, only publish when client online
const char *mqtt_topic_status = "myplant/status";            // status keran RUNNING | PAUSED | OFF
const char *mqtt_topic_duration = "myplant/duration";        // for runtime duration in ms
const char *mqtt_topic_runtime = "myplant/runtime";          // for runtime keran in ms
const char *mqtt_topic_relay_mode = "myplant/keranmode";     // for spesific keran mode "now" | "datetime"
const char *mqtt_topic_device_mode = "myplant/devicemode";   // for device mode SCHEDULE | MANUAL
const char *mqtt_topic_confirm = "myplant/confirm";   // for confirmation / ack
// Number of relays
const int numberOfRelays = 12;

// Pin assignments for relays
// 1-D22, 2-D23, 3-D5, 4-D18, 5-D21, 6-D19
// 7-D27, 8-D14, 9-D26, 10-D04, 11-D19, 12-D33

std::vector<int> relayPins = {22, 23, 5, 18, 21, 19, 27, 14, 26, 4, 32, 33}; // Ensure this matches the number of relays

// Pins for RGB LED
const int wifiLedPin = 12;   // GPIO pin for Wifi status LED
const int mqttLedPin = 13; // GPIO pin for MQTT status LED

unsigned long wifiPreviousMillis = 0;
unsigned long mqttPreviousMillis = 0;
const long blinkInterval = 1400; // 1.4 seconds for blink led connection

bool isClientOnline = false;
bool wifiLedState = false;
bool mqttLedState = false;

// Relay states and runtimes
std::vector<String> relayState(numberOfRelays, "OFF");
std::vector<unsigned long> relayDuration(numberOfRelays, 0);
std::vector<unsigned long> relayRuntime(numberOfRelays, 0);
std::vector<unsigned long> lastMillis(numberOfRelays, 0);

unsigned long previousMillis = 0; // Last time the time was updated

WiFiClientSecure espClient;
PubSubClient mqtt_client(espClient);

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 8 * 3600, 60000); // UTC+8 for Bali

// Variables for scheduling
String deviceMode = "MANUAL"; // SCHEDULED | MANUAL
String startDate = "";
String startTime = "";

bool sequenceActive = false;
bool isAlternate = true;            // default nyala bergantian
time_t nextRelayActivationTime = 0; // Variable to track when to activate the next relay

std::vector<int>::size_type currentRelayIndex = 0;
std::vector<int>::size_type nextDuration = 0; // in minute

std::vector<int> relayOrder;
std::vector<int> bookedRelay;

// Function prototypes
void connectToWiFi();
void connectToMQTTBroker();
void receivedMessage(char *topic, byte *payload, unsigned int length);
void controlRelay(int relayID, String command, int duration);
void publishRelayStatus();
void publishRelayDuration();
void publishRelayRuntime();
void initState();
void scheduleRelays(String message);
void activateNextRelay();
void startScheduleMode(unsigned long delayMillis);

time_t parseScheduledTime(String date, String time);

void setup()
{
  Serial.begin(9600);
  // Initialize RGB LED pins
  pinMode(wifiLedPin, OUTPUT);
  pinMode(mqttLedPin, OUTPUT);

  espClient.setInsecure();

  WiFi.begin(ssid, password);
  connectToWiFi();

  mqtt_client.setServer(mqtt_broker, mqtt_port);
  mqtt_client.setCallback(receivedMessage);

  // connectToMQTTBroker();

  // Initialize Relays
  for (int pin : relayPins)
  {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, HIGH); // HIGH = OFF
  }

  // Start NTP client
  timeClient.begin();
  while (!timeClient.update())
  {
    timeClient.forceUpdate();
  }

  callRelayState();
  publishModeStatus();
}

void updateWifiLED() {
  unsigned long currentMillis = millis();

  // WiFi LED logic
  if (currentMillis - wifiPreviousMillis >= blinkInterval) {
    wifiPreviousMillis = currentMillis;
    wifiLedState = !wifiLedState;
    digitalWrite(wifiLedPin, wifiLedState);
  }
}

void updateMqttLED(){
  unsigned long currentMillis = millis();
  // MQTT LED logic
  if (currentMillis - mqttPreviousMillis >= blinkInterval) {
    mqttPreviousMillis = currentMillis;
    mqttLedState = !mqttLedState;
    digitalWrite(mqttLedPin, mqttLedState);
  }
}

void connectToWiFi() {
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts++ < 20) {
    Serial.print(".");
    updateWifiLED();
    delay(500);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI CONNECTED]");
    digitalWrite(wifiLedPin, HIGH);
  } else {
    Serial.println("\n[WIFI CONNECTION TIMEOUT]");
  }
}

void connectToMQTTBroker() {
  while (!mqtt_client.connected()) {
    Serial.print("Connecting to MQTT...");
    delay(500);
    
    String client_id = "noid-client-" + String(WiFi.macAddress());

    if (mqtt_client.connect(
        client_id.c_str(),
        mqtt_username,
        mqtt_password,
        mqtt_topic_device_connected, // LWT topic
        1,
        true,
        "offline"
)) {
      mqtt_client.subscribe(mqtt_topic_control);
      mqtt_client.subscribe(mqtt_topic_web_connected);
      mqtt_client.subscribe(mqtt_topic_relay_mode);
      mqtt_client.subscribe(mqtt_topic_bulk_control);

      Serial.println("[MQTT CONNECTED]");
      mqtt_client.publish(mqtt_topic_device_connected, "online");
      digitalWrite(mqttLedPin, HIGH);
    } else {
      Serial.println("Failed to connect to MQTT broker. Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void receivedMessage(char *topic, byte *payload, unsigned int length)
{
  String message;
  
  for (unsigned int i = 0; i < length; i++){
    message += (char)payload[i];
  }

  // Print the message and result to the serial monitor
  Serial.print("Received ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(message);

  if (String(topic) == mqtt_topic_web_connected)
  {
    if (message == "online")
    {
      isClientOnline = true;
      callRelayState();
      publishModeStatus();
    } else {
      isClientOnline = false;
    }
  }

  else if (String(topic) == mqtt_topic_control)
  {
    processMessage(message);
  }

  else if (String(topic) == mqtt_topic_relay_mode)
  {
    scheduleRelays(message);
    publishModeStatus();
    mqtt_client.publish(mqtt_topic_confirm, "ok");
  }

  else if (String(topic) == mqtt_topic_bulk_control)
  {
    resetAllStates();
    bulkControl(message);
    publishModeStatus();
    mqtt_client.publish(mqtt_topic_confirm, "ok");
  }
}

void processMessage(String message)
{
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error)
  {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.f_str());
    return;
  }

  int keranID = doc["keranID"];
  String status = doc["status"];
  int duration = doc["duration"] | 0;

  if (keranID < 0 || keranID >= numberOfRelays)
  {
    Serial.println("Invalid keranID");
    return;
  }

  controlRelay(keranID, status, duration);
}

void bulkControl(const String &message)
{
  // Parse the incoming message for the indices
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error)
  {
    Serial.println("Failed to parse bulk control message");
    return;
  }

  // Extract the "index" array from the message
  if (!doc.containsKey("listKeran"))
  {
    Serial.println("Bulk control message missing 'index' key");
    return;
  }

  JsonArray indices = doc["listKeran"].as<JsonArray>();

  // Turn off relays for all specified indices
  for (int index : indices)
  {
    if (index >= 0 && index < numberOfRelays)
    { // Ensure valid relay index
      if (relayState[index] == "RUNNING")
      {
        controlRelay(index, "OFF", 0); // Turn OFF the relay
        Serial.printf("Relay %d turned OFF via bulk control\n", index + 1);
      }
    }
    else
    {
      Serial.printf("Invalid relay index: %d\n", index);
    }
  }
}

void controlRelay(int relayID, String command, int duration)
{
  if (relayID < 0 || relayID >= numberOfRelays)
  {
    Serial.println("Invalid relay index.");
    mqtt_client.publish(mqtt_topic_confirm, "error");
    return;
  }

  // Print the control command for debugging
  Serial.printf("Control command for relay %d: %s\n", relayID + 1, command.c_str());

  if (command == "RUNNING")
  {
    // Turn on the specific relay
    digitalWrite(relayPins[relayID], LOW); // LOW = ON

    if (relayState[relayID] != "RUNNING")
    {
      relayState[relayID] = "RUNNING";
      lastMillis[relayID] = millis() - relayRuntime[relayID]; // Resume from where it left off
    }

    relayDuration[relayID] = duration == 0 ? 0 : duration * 60000UL; // Convert to ms if not indefinite
  }
  else if (command == "PAUSED")
  {
    digitalWrite(relayPins[relayID], HIGH); // HIGH = OFF

    if (relayState[relayID] == "RUNNING")
    {
      relayState[relayID] = "PAUSED";
      relayRuntime[relayID] = millis() - lastMillis[relayID]; // Capture runtime at pause
    }
  }
  else if (command == "OFF")
  {
    // Turn off the specific relay and reset its state
    digitalWrite(relayPins[relayID], HIGH); // HIGH = OFF

    relayState[relayID] = "OFF";
    relayRuntime[relayID] = 0; // Reset runtime
    relayDuration[relayID] = 0;
    lastMillis[relayID] = millis(); // Reset start time
  }

  mqtt_client.publish(mqtt_topic_confirm, "ok");
  callRelayState();
}

void publishMessage(const char *topic, const char *dataType)
{
  StaticJsonDocument<256> doc;

  if (strcmp(dataType, "status") == 0)
  {
    for (int i = 0; i < numberOfRelays; i++)
    {
      doc[String(i + 1)] = relayState[i]; // Assuming relayState contains String values
    }
  }
  else if (strcmp(dataType, "duration") == 0)
  {
    for (int i = 0; i < numberOfRelays; i++)
    {
      doc[String(i + 1)] = relayDuration[i] / 60000; // Convert milliseconds to minutes
    }
  }
  else if (strcmp(dataType, "runtime") == 0)
  {
    for (int i = 0; i < numberOfRelays; i++)
    {
      doc[String(i + 1)] = relayRuntime[i];
    }
  }

  uint8_t buffer[256]; // Change buffer type to uint8_t[]
  size_t len = serializeJson(doc, buffer, sizeof(buffer));

  // Publish the message with retain flag set to false
  bool success = mqtt_client.publish(topic, buffer, len, false); // false means no retain flag

  // Print the message and result to the serial monitor
  Serial.print("Published ");
  Serial.print(topic);
  Serial.print(": ");
  Serial.println(success ? "Success" : " Error");
}

void publishModeStatus()
{
  if (!isClientOnline) return;

  StaticJsonDocument<256> doc;
  doc["mode"] = deviceMode;
  doc["date"] = startDate;        // Send startDate as is
  doc["time"] = startTime;        // Send startTime as is
  doc["duration"] = nextDuration; // duration

  // Add bookedRelay as a JSON array
  JsonArray bookedArray = doc.createNestedArray("booked");
  for (int relay : bookedRelay)
  {
    bookedArray.add(relay);
  }

  char buffer[256];
  serializeJson(doc, buffer, sizeof(buffer));
  bool success = mqtt_client.publish(mqtt_topic_device_mode, buffer);

  // Print the message and result to the serial monitor
  Serial.print("Published ");
  Serial.print(mqtt_topic_device_mode);
  Serial.print(": ");
  Serial.println(success ? "Success" : " Error");
}

// Publish relay status
void publishRelayStatus()
{
  publishMessage(mqtt_topic_status, "status");
}

// Publish relay duration
void publishRelayDuration()
{
  publishMessage(mqtt_topic_duration, "duration");
}

// Publish relay runtime
void publishRelayRuntime()
{
  publishMessage(mqtt_topic_runtime, "runtime");
}

void scheduleRelays(String message)
{
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error)
  {
    Serial.print("Failed to parse JSON: ");
    Serial.println(error.f_str());
    return;
  }

  // Example message format: {"order":[1,2,3], "nextDuration": 600, "startDate": "2025-01-18", "startTime": "10:00"}
  JsonArray order = doc["order"];
  nextDuration = doc["nextDuration"].as<int>();
  startDate = doc["startDate"].as<String>();
  startTime = doc["startTime"].as<String>();
  isAlternate = doc["isAlternate"].as<bool>();

  deviceMode = "SCHEDULE"; // Immediate start in SCHEDULE mode

  // Update relay orders and active states
  relayOrder.resize(order.size());
  bookedRelay.resize(order.size());

  for (int i = 0; i < order.size(); i++)
  {
    relayOrder[i] = order[i];
    bookedRelay[i] = order[i];
  }

  if (startDate == "now" && startTime == "now")
  {
    Serial.println("Starting sequence : NOW");
    nextRelayActivationTime = getCurrentTime();
  }
  else
  {
    nextRelayActivationTime = getScheduleTime();
  }

  sequenceActive = true;
  currentRelayIndex = 0;
}

void activateNextRelay()
{
  // check if all DONE
  if (currentRelayIndex >= relayOrder.size() && getCurrentTime() >= nextRelayActivationTime)
  {
    Serial.println("Sequencing is DONE!!");
    resetAllStates();
    publishModeStatus();
    return;
  }

  int relayID = relayOrder[currentRelayIndex];
  controlRelay(relayID, "RUNNING", nextDuration); // Run the relay for the given duration

  if (isAlternate) // Update the activation time for the next relay
  {
    // If alternate mode, activate the next relay after the same duration
    if (currentRelayIndex > 0)
    {
      removeBookedRelay(bookedRelay); // remove booked/schedule relay
    }

    nextRelayActivationTime = getCurrentTime() + (nextDuration * 60); // minute to seconds
  }
  else
  {
    nextRelayActivationTime = getCurrentTime(); // If simultaneous mode, activate the next relay simultaneously after the duration
  }

  Serial.print("Booked Relay: ");
  for (size_t i = 0; i < bookedRelay.size(); i++)
  {
    Serial.print(bookedRelay[i]);
    if (i < bookedRelay.size() - 1)
    {
      Serial.print(", "); // Add a comma between elements
    }
  }

  Serial.println();
  Serial.print("IsAlternate: ");
  Serial.println(isAlternate);

  publishModeStatus(); // update relay booked and device status to client
  currentRelayIndex++; // Move to the next relay in the sequence
}

void removeBookedRelay(std::vector<int> &relayList)
{
  if (!relayList.empty())
  {
    relayList.erase(relayList.begin()); // Remove the first element
  }
  else
  {
    Serial.println("Relay list is empty! Nothing to remove.");
  }
}

time_t parseScheduledTime(String date, String time)
{ // Parse Scheduled Date and Time into Epoch Time
  tm timeStruct;

  // Parse date (e.g., "2025-01-18")
  timeStruct.tm_year = date.substring(0, 4).toInt() - 1900; // Year
  timeStruct.tm_mon = date.substring(5, 7).toInt() - 1;     // Month (0-11)
  timeStruct.tm_mday = date.substring(8, 10).toInt();       // Day

  // Parse time (e.g., "05:40")
  timeStruct.tm_hour = time.substring(0, 2).toInt(); // Hour
  timeStruct.tm_min = time.substring(3, 5).toInt();  // Minute
  timeStruct.tm_sec = 0;                             // Seconds (default to 0)

  return mktime(&timeStruct);
}

time_t getCurrentTime()
{
  timeClient.update();                    // Update time
  time_t now = timeClient.getEpochTime(); // Get current time

  return now;
}

time_t getScheduleTime()
{
  timeClient.update();                                              // Update time
  time_t scheduledEpoch = parseScheduledTime(startDate, startTime); // Get current time

  return scheduledEpoch;
}

void callRelayState()
{
  if (!isClientOnline) return;

  publishRelayStatus();
  publishRelayDuration();
  publishRelayRuntime();
}

void loop()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("[WIFI LOST] Reconnecting...");
    connectToWiFi();
    return;
  }
    
  if (!mqtt_client.connected())
  {
    updateMqttLED();
    connectToMQTTBroker();
  }

  mqtt_client.loop();

  if (deviceMode == "SCHEDULE" && sequenceActive) // If the device is in scheduled mode, we need to activate the relays according to the schedule
  {

    if (getCurrentTime() >= nextRelayActivationTime) // Check if it's time to activate the next relay
    {
      activateNextRelay(); // Activate the current relay

      if (currentRelayIndex >= relayOrder.size()) // Check if we have activated all relays
      {
        nextRelayActivationTime = getCurrentTime() + (nextDuration * 60); // wait all relay done based on its duration
      }
    }
  }

  for (int i = 0; i < numberOfRelays; i++) // Manage the relays' runtime and handle the auto-off feature based on the relay duration
  {
    if (relayState[i] == "RUNNING")
    {
      relayRuntime[i] = millis() - lastMillis[i];

      if (relayDuration[i] != 0 && relayRuntime[i] >= relayDuration[i])
      {
        controlRelay(i, "OFF", 0); // Turn OFF relay after duration
        Serial.printf("Relay %d automatically turned OFF after duration\n", i + 1);
      }
    }
  }

}

void resetAllStates() /// Reset other global variables
{
  deviceMode = "MANUAL";
  startDate = "";
  startTime = "";
  sequenceActive = false;
  isAlternate = true; // Default to alternate mode
  currentRelayIndex = 0;
  nextRelayActivationTime = 0;
  nextDuration = 0;
  bookedRelay.clear();
}