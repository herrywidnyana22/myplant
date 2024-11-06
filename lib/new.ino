#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include <vector>

// WiFi and MQTT credentials
const char *ssid = "MyHOT";
const char *password = "HotBanget*123#";
const char *mqtt_broker = "u67e3c9f.ala.asia-southeast1.emqxsl.com";
const int mqtt_port = 8883;
const char *mqtt_username = "myplant";
const char *mqtt_password = "myplant12345";

// MQTT topics
const char *mqtt_topic_control = "myplant/control";
const char *mqtt_topic_web = "myplant/web";
const char *mqtt_topic_status = "myplant/status";
const char *mqtt_topic_duration = "myplant/duration";
const char *mqtt_topic_runtime = "myplant/runtime";
const char *mqtt_topic_mode = "myplant/mode";
const char *mqtt_topic_schedule = "myplant/schedule";

// Number of relays
const int numberOfRelays = 6; // You can change this number to adjust the relay count

// Pin assignments for relays
std::vector<int> relayPins = {D1, D2, D3, D4, D5, D6}; // Ensure this matches the number of relays

// Relay states and runtimes
std::vector<String> relayState(numberOfRelays, "OFF");
std::vector<unsigned long> relayDuration(numberOfRelays, 0);
std::vector<unsigned long> relayRuntime(numberOfRelays, 0);
std::vector<unsigned long> lastMillis(numberOfRelays, 0);

WiFiClientSecure espClient;
PubSubClient mqtt_client(espClient);
Ticker relayTicker;

// Variables for scheduling
bool modeStatus = false; // true for scheduling, false for not scheduling
bool sequenceActive = false;
unsigned long nextRelayActivationTime = 0; // Variable to track when to activate the next relay
unsigned long sequenceStartTime = 0;

int currentRelayIndex = 0;
int sequenceDuration = 0;

std::vector<int> relayOrder(numberOfRelays);
std::vector<bool> relayIsActive(numberOfRelays, false);

// Function prototypes
void connectToWiFi();
void connectToMQTTBroker();
void mqttCallback(char *topic, byte *payload, unsigned int length);
void controlRelay(int relayID, String command, int duration);
void publishRelayStatus();
void publishRelayDuration();
void publishRelayRuntime();
void initState();
void scheduleRelays(String message);
void activateNextRelay();
void startSequence(unsigned long delayMillis);
unsigned long parseDateTime(String date, String time);

void setup()
{
    Serial.begin(9600);
    espClient.setInsecure();

    for (int i = 0; i < numberOfRelays; i++)
    {
        pinMode(relayPins[i], OUTPUT);
        digitalWrite(relayPins[i], HIGH); // Initial state (HIGH = OFF)
    }

    connectToWiFi();
    mqtt_client.setServer(mqtt_broker, mqtt_port);
    mqtt_client.setCallback(mqttCallback);
    connectToMQTTBroker();

    initState();
}

void connectToWiFi()
{
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");
}

void connectToMQTTBroker()
{
    while (!mqtt_client.connected())
    {
        String client_id = "esp8266-client-" + String(WiFi.macAddress());
        if (mqtt_client.connect(client_id.c_str(), mqtt_username, mqtt_password))
        {
            mqtt_client.subscribe(mqtt_topic_control);
            mqtt_client.subscribe(mqtt_topic_web);
            mqtt_client.subscribe(mqtt_topic_mode);
            Serial.println("Connected to MQTT Broker");
        }
        else
        {
            Serial.println("Failed to connect to MQTT broker. Retrying in 5 seconds...");
            delay(5000);
        }
    }
}

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String message;
    for (unsigned int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }

    Serial.println("Message received:");
    Serial.print("Topic: ");
    Serial.println(topic);
    Serial.print("Payload: ");
    Serial.println(message);

    if (String(topic) == mqtt_topic_web)
    {
        if (message == "init")
        {
            initState();
        }
    }
    else if (String(topic) == mqtt_topic_control)
    {
        processMessage(message);
    }
    else if (String(topic) == mqtt_topic_mode)
    {
        scheduleRelays(message);
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

void controlRelay(int relayID, String command, int duration)
{
    if (relayID < 0 || relayID >= numberOfRelays)
    {
        Serial.println("Invalid relay index.");
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
        Serial.printf("Relay %d set to RUNNING with duration %d ms\n", relayID + 1, relayDuration[relayID]);
    }
    else if (command == "PAUSED")
    {
        // Turn off the specific relay without resetting runtime
        digitalWrite(relayPins[relayID], HIGH); // HIGH = OFF
        if (relayState[relayID] == "RUNNING")
        {
            relayState[relayID] = "PAUSED";
            relayRuntime[relayID] = millis() - lastMillis[relayID]; // Capture runtime at pause
        }
        Serial.printf("Relay %d paused\n", relayID + 1);
    }
    else if (command == "OFF")
    {
        // Turn off the specific relay and reset its state
        digitalWrite(relayPins[relayID], HIGH); // HIGH = OFF
        relayState[relayID] = "OFF";
        relayRuntime[relayID] = 0; // Reset runtime
        relayDuration[relayID] = 0;
        lastMillis[relayID] = millis(); // Reset start time
        Serial.printf("Relay %d turned OFF\n", relayID + 1);
    }

    initState();
}

void publishRelayStatus()
{
    StaticJsonDocument<256> doc;
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < numberOfRelays; i++)
    {
        JsonObject obj = arr.createNestedObject();
        obj["name"] = "keran" + String(i + 1);
        obj["status"] = relayState[i];
    }

    char buffer[256];
    serializeJson(arr, buffer, sizeof(buffer));
    mqtt_client.publish(mqtt_topic_status, buffer);
    Serial.println("Published relay status");
}

void publishRelayDuration()
{
    StaticJsonDocument<256> doc;
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < numberOfRelays; i++)
    {
        JsonObject obj = arr.createNestedObject();
        obj["name"] = "keran" + String(i + 1);
        obj["duration"] = relayDuration[i] / 60000;
    }

    char buffer[256];
    serializeJson(arr, buffer, sizeof(buffer));
    mqtt_client.publish(mqtt_topic_duration, buffer);
    Serial.println("Published relay duration");
}

void publishRelayRuntime()
{
    StaticJsonDocument<256> doc;
    JsonArray arr = doc.to<JsonArray>();

    for (int i = 0; i < numberOfRelays; i++)
    {
        JsonObject obj = arr.createNestedObject();
        obj["name"] = "keran" + String(i + 1);
        obj["runtime"] = relayRuntime[i];
    }

    char buffer[256];
    serializeJson(arr, buffer, sizeof(buffer));
    mqtt_client.publish(mqtt_topic_runtime, buffer);
    Serial.println("Published relay runtime");
}

void publishModeStatus(String startDate, String startTime)
{
    StaticJsonDocument<256> doc;
    doc["mode"] = modeStatus ? "schedule" : "not schedule";

    // Check if startDate and startTime are "now"
    if (startDate == "now" && startTime == "now")
    {
        doc["startDate"] = "now"; // Send "now" as a string
    }
    else
    {
        doc["startDate"] = startDate + " " + startTime; // Combine date and time
    }

    doc["duration"] = sequenceDuration / 60000; // Convert milliseconds to minutes

    char buffer[256];
    serializeJson(doc, buffer, sizeof(buffer));
    mqtt_client.publish(mqtt_topic_schedule, buffer);
    Serial.println("Published schedule status");
}

void initState()
{
    publishRelayStatus();
    publishRelayDuration();
    publishRelayRuntime();
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

    JsonArray order = doc["order"];
    JsonArray isActive = doc["isActive"];
    sequenceDuration = doc["nextDuration"].as<int>() * 60000;
    String startDate = doc["startDate"];
    String startTime = doc["startTime"];

    // Update modeStatus based on the message
    modeStatus = (startDate == "now" && startTime == "now");

    for (int i = 0; i < 5; i++)
    {
        relayOrder[i] = order[i];
        relayIsActive[i] = static_cast<bool>(isActive[i]);
    }

    if (modeStatus)
    {
        // If mode is scheduling, start immediately
        startSequence(0);
    }
    else
    {
        // If not scheduling, parse the start time
        sequenceStartTime = parseDateTime(startDate, startTime);
        unsigned long delayMillis = sequenceStartTime - millis();
        startSequence(delayMillis);
    }

    // Publish the mode status with the correct startDate and startTime
    publishModeStatus(startDate, startTime);
}

unsigned long parseDateTime(String date, String time)
{
    struct tm t = {0};
    sscanf(date.c_str(), "%4d-%2d-%2d", &t.tm_year, &t.tm_mon, &t.tm_mday);
    sscanf(time.c_str(), "%2d:%2d:%2d", &t.tm_hour, &t.tm_min, &t.tm_sec);
    t.tm_year -= 1900;        // Years since 1900
    t.tm_mon -= 1;            // Months since January
    return mktime(&t) * 1000; // Convert to milliseconds
}

void activateNextRelay()
{
    if (!sequenceActive || currentRelayIndex >= numberOfRelays)
    {
        sequenceActive = false; // End sequence if all relays have been processed
        currentRelayIndex = 0;
        Serial.println("Relay sequence completed");
        return;
    }

    if (relayIsActive[currentRelayIndex])
    {
        int relayID = relayOrder[currentRelayIndex];
        Serial.printf("Activating relay %d in sequence\n", relayID + 1);
        controlRelay(relayID, "RUNNING", sequenceDuration / 60000); // Convert ms to min

        currentRelayIndex++; // Move to the next relay
        if (currentRelayIndex < numberOfRelays && relayIsActive[currentRelayIndex])
        {
            relayTicker.attach_ms(sequenceDuration, activateNextRelay); // Schedule next relay
        }
    }
    else
    {
        currentRelayIndex++;
        activateNextRelay(); // Skip to next if the current one is not active
    }
}

void startSequence(unsigned long delayMillis)
{
    if (delayMillis > 0)
    {
        Serial.printf("Scheduling sequence to start in %lu milliseconds\n", delayMillis);
        sequenceStartTime = millis() + delayMillis;  // Set the start time for the sequence
        nextRelayActivationTime = sequenceStartTime; // Initialize the next relay activation time
    }
    else
    {
        Serial.println("Starting sequence immediately");
        nextRelayActivationTime = millis(); // Set the activation time to now
    }

    sequenceActive = true;
    currentRelayIndex = 0; // Reset to start from the first relay in the order
}

void loop()
{
    if (!mqtt_client.connected())
    {
        connectToMQTTBroker();
    }
    mqtt_client.loop();

    for (int i = 0; i < numberOfRelays; i++)
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

    if (sequenceActive)
    {
        unsigned long currentMillis = millis();

        // Check if it's time to activate the next relay
        if (currentMillis >= nextRelayActivationTime)
        {
            activateNextRelay(); // Activate the current relay

            // Update the activation time for the next relay
            nextRelayActivationTime += relayIsActive[currentRelayIndex] ? sequenceDuration : 0; // Adjust for next relay activation time

            // Move to the next relay in the sequence
            currentRelayIndex++;

            // Check if we have activated all relays
            if (currentRelayIndex >= relayOrder.size())
            {
                Serial.println("All relays have been activated.");
                sequenceActive = false; // Stop the sequence
            }
        }
    }
}
