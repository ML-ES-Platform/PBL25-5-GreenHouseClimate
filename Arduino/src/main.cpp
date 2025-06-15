#include <Config.h>
#include <Arduino.h>
#include "DHTSensor.h"
#include "Control.h"
#include "RelayDriver.h"
#include <Wire.h>
#include <BH1750.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

// Pin configuration for ESP32
#define DHTPIN 23    
#define LED_PIN 18

// Window control relays
#define WINDOW_OPEN_RELAY 27   
#define WINDOW_CLOSE_RELAY 33

// Motor fan relays
#define FAN_RELAY 16
#define LED_RELAY 2

// API endpoints
const char* loginURL = "http://44.201.250.1:8080/auth/login";
const char* dataURL = "http://44.201.250.1:8080/sensor-measurements/add";

// MQTT Topics
String command_topic;

// Authentication variables
String jwtToken = "";
unsigned long tokenExpireTime = 0;

// NTP settings
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 10800; // GMT+3 (Chisinau timezone) = 3 * 3600 seconds
const int daylightOffset_sec = 0;  // No daylight saving offset

BH1750 lightMeter;
DHTSensor tempSensor(DHTPIN, DHT11);

// MQTT client
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// System state variables
bool windowOpen = false;
bool fanRunning = false;
bool ledOn = false;
bool manualOverride = false;  // Flag to indicate manual control via MQTT
double temperatureSetpoint = 33.0;  // Default temperature setpoint
double humiditySetpoint = 60.0;  // Default humidity setpoint
double lightSetpoint = 100.0;  // Default light setpoint in lux

bool manualOverrideWindow = false;
bool manualOverrideFan = false;
bool manualOverrideLED = false;

bool lastWindowState = false;
bool lastFanState = false;
bool lastLEDState = false;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastAPICall = 0;
unsigned long lastLoginAttempt = 0;
unsigned long lastMqttReconnect = 0;
const unsigned long SENSOR_INTERVAL = 2000;  // Read sensors every 2 seconds
const unsigned long API_INTERVAL = 15000;    // Send data every 15 seconds
const unsigned long LOGIN_RETRY_INTERVAL = 30000; // Retry login every 30 seconds
const unsigned long MQTT_RECONNECT_INTERVAL = 5000; // Try to reconnect MQTT every 5 seconds

void openWindow();
void closeWindow();
void startFan();
void stopFan();
void processCommand(const JsonDocument& doc);
void mqttCallback(char* topic, byte* payload, unsigned int length);
void updateControlPanelState();

void initializeWiFi() {
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("");
        Serial.println("WiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        
    } else {
        Serial.println("");
        Serial.println("WiFi connection failed - continuing without internet");
    }
}

void setupMQTT() {
    command_topic = "greenhouse/" + String(thing_name) + "/commands";
    
    // Configure WiFiClientSecure
    espClient.setCACert(aws_root_ca);
    espClient.setCertificate(certificate);
    espClient.setPrivateKey(private_key);
    
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setBufferSize(1024);
    
    Serial.println("MQTT configured");
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.printf("Message received on topic: %s\n", topic);
    
    // Convert payload to string
    char message[length + 1];
    memcpy(message, payload, length);
    message[length] = '\0';
    
    Serial.printf("Message: %s\n", message);
    
    // Parse JSON command
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
        Serial.printf("JSON parsing failed: %s\n", error.c_str());
        return;
    }
    
    processCommand(doc);
}

void processCommand(const JsonDocument& doc) {
    String commandType = doc["commandType"].as<String>();
    JsonVariantConst payload = doc["payload"];
    
    Serial.printf("Processing command: %s\n", commandType.c_str());
    
    if (commandType == "TOGGLE_WINDOWS") {
        bool state = payload["state"];
        Serial.printf("Window command received: %s\n", state ? "OPEN" : "CLOSE");
        
        manualOverrideWindow = true;  // Enable manual override for windows only
        if (state) {
            openWindow();
        } else {
            closeWindow();
        }
        
    } else if (commandType == "TOGGLE_FANS") {
        bool state = payload["state"];
        Serial.printf("Fan command received: %s\n", state ? "START" : "STOP");
        
        manualOverrideFan = true;  // Enable manual override for fan only
        if (state) {
            startFan();
        } else {
            stopFan();
        }
        
    } else if (commandType == "TOGGLE_LIGHTS") {
        bool state = payload["state"];
        Serial.printf("Light command received: %s\n", state ? "ON" : "OFF");
        
        manualOverrideLED = true;  // Enable manual override for LED only
        digitalWrite(LED_RELAY, state ? LOW : HIGH);
        ledOn = state;
        lastLEDState = state;  // Update state tracking
        Serial.printf("LED manually set to: %s\n", ledOn ? "ON" : "OFF");
        
    } else if (commandType == "SET_TEMPERATURE") {
        double setpoint = payload["setpoint"].as<double>();
        temperatureSetpoint = setpoint;
        Serial.printf("Temperature setpoint changed to: %.1f°C\n", temperatureSetpoint);
    } else if (commandType == "SET_HUMIDITY") {
        double setpoint = payload["setpoint"].as<double>();
        humiditySetpoint = setpoint;
        Serial.printf("Humidity setpoint changed to: %.1f%%\n", humiditySetpoint);
    } else if (commandType == "SET_LIGHT") {
        double setpoint = payload["setpoint"].as<double>();
        lightSetpoint = setpoint;
        Serial.printf("Light setpoint changed to: %.1f lx\n", lightSetpoint);
    } else if (commandType == "SET_AUTO_MODE") {
        // Enable automatic mode (disable manual override for all devices)
        manualOverrideWindow = false;
        manualOverrideFan = false;
        manualOverrideLED = false;
        Serial.println("Automatic mode enabled for all devices");

    } else if (commandType == "REQUEST_UPDATE") {
        updateControlPanelState();
        Serial.println("Control panel state update requested, sending current state...");
    } else {
        Serial.printf("Unknown command type: %s\n", commandType.c_str());
    }
}

void connectToMQTT() {
    while (!mqttClient.connected() && WiFi.status() == WL_CONNECTED) {
        Serial.print("Attempting MQTT connection...");
        
        if (mqttClient.connect(client_id)) {
            Serial.println("connected");
            
            // Subscribe to command topic
            if (mqttClient.subscribe(command_topic.c_str())) {
                Serial.printf("Subscribed to topic: %s\n", command_topic.c_str());
            } else {
                Serial.println("Failed to subscribe to command topic");
            }
            
        } else {
            Serial.printf("failed, rc=%d ", mqttClient.state());
            Serial.println("trying again in 5 seconds");
            delay(5000);
        }
    }
}

void openWindow() {
    if (!windowOpen && lastWindowState != true) {
        Serial.println("Opening window...");
        digitalWrite(WINDOW_CLOSE_RELAY, HIGH);  // Ensure close relay is OFF
        digitalWrite(WINDOW_OPEN_RELAY, LOW);    // Activate open relay
        delay(5000); // Run for 5 seconds
        digitalWrite(WINDOW_OPEN_RELAY, HIGH);   // Deactivate open relay
        windowOpen = true;
        lastWindowState = true;
        Serial.println("Window opened");
    } else if (windowOpen) {
        Serial.println("Window already open - no action needed");
    }
}

void closeWindow() {
    if (windowOpen && lastWindowState != false) {
        Serial.println("Closing window...");
        digitalWrite(WINDOW_OPEN_RELAY, HIGH);   // Ensure open relay is OFF
        digitalWrite(WINDOW_CLOSE_RELAY, LOW);   // Activate close relay
        delay(5000); // Run for 5 seconds
        digitalWrite(WINDOW_CLOSE_RELAY, HIGH);  // Deactivate close relay
        windowOpen = false;
        lastWindowState = false;
        Serial.println("Window closed");
    } else if (!windowOpen) {
        Serial.println("Window already closed - no action needed");
    }
}

void startFan() {
    if (1) return;  // Disable fan control for now
    if (!fanRunning && lastFanState != true) {  // Only act if state actually changed
        Serial.println("Starting motor fan...");
        digitalWrite(FAN_RELAY, HIGH);  
        fanRunning = true;
        lastFanState = true;
        Serial.println("Motor fan started");
    } else if (fanRunning) {
        Serial.println("Fan already running - no action needed");
    }
}

void stopFan() {
    if (1) return;
    if (fanRunning && lastFanState != false) {  // Only act if state actually changed
        Serial.println("Stopping motor fan...");
        digitalWrite(FAN_RELAY, LOW);
        fanRunning = false;
        lastFanState = false;
        Serial.println("Motor fan stopped");
    } else if (!fanRunning) {
        Serial.println("Fan already stopped - no action needed");
    }
}

void controlLED(float lightLevel) {
    if (!manualOverrideLED) {
        bool shouldBeOn = (lightLevel < lightSetpoint);
        
        if (shouldBeOn && (!ledOn || lastLEDState != true)) {
            digitalWrite(LED_RELAY, LOW);
            ledOn = true;
            lastLEDState = true;
            Serial.printf("LED turned ON (light: %.1f < %.1f lx)\n", lightLevel, lightSetpoint);
            updateControlPanelState();  // Update control panel state when LED changes
        } else if (!shouldBeOn && (ledOn || lastLEDState != false)) {
            digitalWrite(LED_RELAY, HIGH);
            ledOn = false;
            lastLEDState = false;
            Serial.printf("LED turned OFF (light: %.1f >= %.1f lx)\n", lightLevel, lightSetpoint);
            updateControlPanelState();  // Update control panel state when LED changes
        }
    }
}

// Improved controlSystems function with proper manual override handling
void controlSystems(float temperature, float humidity, float lightLevel) {
    // Control LED based on light level (only if not in manual override)
    controlLED(lightLevel);
    
    // Control window based on temperature (only if not in manual override)
    if (!manualOverrideWindow) {
        if (temperature > temperatureSetpoint && !windowOpen) {
            openWindow();
            Serial.printf("Window opened for cooling (temperature: %.1f°C > %.1f°C)\n", temperature, temperatureSetpoint);
            updateControlPanelState();  // Update control panel state when window changes
        } else if (temperature <= temperatureSetpoint && windowOpen) {
            closeWindow();
            Serial.printf("Window closed (temperature: %.1f°C <= %.1f°C)\n", temperature, temperatureSetpoint);
            updateControlPanelState();  // Update control panel state when window changes
        }
    }
    
    // Control fan based on humidity (only if not in manual override)
    if (!manualOverrideFan) {
        if (humidity > humiditySetpoint && !fanRunning) {
            startFan();
            Serial.printf("Fan started for dehumidifying (humidity: %.1f%% > %.1f%%)\n", humidity, humiditySetpoint);
            updateControlPanelState();  // Update control panel state when fan changes
        } else if (humidity <= humiditySetpoint && fanRunning) {
            stopFan();
            Serial.printf("Fan stopped (humidity: %.1f%% <= %.1f%%)\n", humidity, humiditySetpoint);
            updateControlPanelState();  // Update control panel state when fan changes
        }
    }
    
    // Debug output for manual override status
    if (manualOverrideWindow || manualOverrideFan || manualOverrideLED) {
        Serial.printf("Manual overrides active - Window: %s, Fan: %s, LED: %s\n", 
                     manualOverrideWindow ? "YES" : "NO",
                     manualOverrideFan ? "YES" : "NO", 
                     manualOverrideLED ? "YES" : "NO");
    }
}

bool authenticateUser() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected - cannot authenticate");
        return false;
    }
    
    HTTPClient http;
    http.begin(loginURL);
    http.addHeader("Content-Type", "application/json");
    
    // Create login payload
    StaticJsonDocument<100> loginDoc;
    loginDoc["email"] = "dima@gmail.com";
    loginDoc["password"] = "123";
    
    String loginPayload;
    serializeJson(loginDoc, loginPayload);
    
    Serial.println("Attempting to authenticate...");
    Serial.println("Login payload: " + loginPayload);
    
    int httpResponseCode = http.POST(loginPayload);
    
    if (httpResponseCode == 200) {
        String response = http.getString();
        Serial.println("Authentication successful!");
        Serial.println("Response: " + response);
        
        // Parse JWT token from response
        StaticJsonDocument<500> responseDoc;
        deserializeJson(responseDoc, response);
        
        jwtToken = responseDoc["token"].as<String>();
        unsigned long expiresIn = responseDoc["expiresIn"];
        tokenExpireTime = millis() + expiresIn;
        
        Serial.println("JWT Token received and stored");
        http.end();
        return true;
    } else {
        Serial.println("Authentication failed!");
        Serial.println("Response Code: " + String(httpResponseCode));
        Serial.println("Response: " + http.getString());
        http.end();
        return false;
    }
}

bool isTokenValid() {
    return (jwtToken.length() > 0 && millis() < tokenExpireTime);
}

void updateControlPanelState() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected - cannot update control panel state");
        return;
    }
    
    // Check if we need to authenticate
    if (!isTokenValid()) {
        Serial.println("Token invalid, attempting to authenticate for control panel update...");
        if (!authenticateUser()) {
            Serial.println("Authentication failed - skipping control panel state update");
            return;
        }
    }
    
    HTTPClient http;
    http.begin("http://44.201.250.1:8080/control-panel/update-state");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + jwtToken);
    
    // Create control panel state payload
    StaticJsonDocument<200> doc;
    doc["areWindowsOpened"] = windowOpen;
    doc["areFansOn"] = fanRunning;
    doc["areLightsOn"] = ledOn;
    doc["temperatureSetpoint"] = temperatureSetpoint;
    doc["humiditySetpoint"] = humiditySetpoint;
    doc["lightSetpoint"] = lightSetpoint;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Updating control panel state...");
    Serial.println("Payload: " + jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Control Panel Update Response Code: " + String(httpResponseCode));
        
        if (httpResponseCode == 200) {
            Serial.println("Control panel state updated successfully!");
        } else if (httpResponseCode == 401) {
            Serial.println("Token expired or invalid - will re-authenticate on next call");
            jwtToken = ""; // Clear invalid token
        }
        
        Serial.println("Response: " + response);
    } else {
        Serial.println("Control Panel Update Error: " + String(httpResponseCode));
    }
    
    http.end();
}

void sendDataToAPI(float temperature, float humidity, float lightLevel) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected - skipping API call");
        return;
    }
    
    // Check if we need to authenticate or re-authenticate
    if (!isTokenValid()) {
        Serial.println("Token invalid or expired, attempting to authenticate...");
        if (!authenticateUser()) {
            Serial.println("Authentication failed - skipping data send");
            return;
        }
    }
    
    HTTPClient http;
    http.begin(dataURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + jwtToken);
    
    // Create sensor data payload
    StaticJsonDocument<200> doc;
    doc["temperature"] = round(temperature);  // Round to integer as per API spec
    doc["humidity"] = round(humidity);        // Round to integer as per API spec  
    doc["light"] = round(lightLevel);         // Round to integer as per API spec
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Sending sensor data to API...");
    Serial.println("Payload: " + jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Data API Response Code: " + String(httpResponseCode));
        
        if (httpResponseCode == 200 || httpResponseCode == 201) {
            Serial.println("Data sent successfully!");
        } else if (httpResponseCode == 401) {
            Serial.println("Token expired or invalid - will re-authenticate on next call");
            jwtToken = ""; // Clear invalid token
        }
        
        Serial.println("API Response: " + response);
    } else {
        Serial.println("Data API Error: " + String(httpResponseCode));
    }
    
    http.end();
}

void printSystemStatus(float temperature, float humidity, float lightLevel) {
    Serial.println("=== SYSTEM STATUS ===");
    Serial.printf("Temperature: %.1f°C (Setpoint: %.1f°C)\n", temperature, temperatureSetpoint);
    Serial.printf("Humidity: %.1f%% (Setpoint: %.1f%%)\n", humidity, humiditySetpoint);
    Serial.printf("Light Level: %.1f lx (Setpoint: %.1f lx)\n", lightLevel, lightSetpoint);
    Serial.printf("Window: %s\n", windowOpen ? "OPEN" : "CLOSED");
    Serial.printf("Fan: %s\n", fanRunning ? "RUNNING" : "STOPPED");
    Serial.printf("LED: %s\n", ledOn ? "ON" : "OFF");
    Serial.printf("Control Mode: %s\n", manualOverride ? "MANUAL" : "AUTOMATIC");
    Serial.printf("MQTT: %s\n", mqttClient.connected() ? "CONNECTED" : "DISCONNECTED");
    Serial.println("=====================");
}

void setup() {  
    Serial.begin(115200);
    delay(1000); 
    
    Serial.println("=== ESP32 Environmental Control System with MQTT ===");
    
    // Initialize all pins
    Serial.println("Initializing pins...");
    
    // LED pin
    pinMode(LED_PIN, OUTPUT); 
    digitalWrite(LED_PIN, LOW); // Start with LED off
    
    // Window control relays
    pinMode(WINDOW_OPEN_RELAY, OUTPUT);
    pinMode(WINDOW_CLOSE_RELAY, OUTPUT);
    digitalWrite(WINDOW_OPEN_RELAY, HIGH);   // Inactive state
    digitalWrite(WINDOW_CLOSE_RELAY, HIGH);  // Inactive state
    
    // Fan control relays
    pinMode(FAN_RELAY, OUTPUT);
    pinMode(LED_RELAY, OUTPUT);
    digitalWrite(FAN_RELAY, LOW);  // Inactive state
    digitalWrite(LED_RELAY, HIGH);  // Inactive state

    lastWindowState = windowOpen;
    lastFanState = fanRunning;
    lastLEDState = ledOn;
    
    Serial.println("All pins initialized");
    
    // Initialize sensors
    Serial.println("Initializing DHT sensor...");
    tempSensor.begin();
    
    Wire.begin(21, 22); // SDA, SCL on ESP32
    lightMeter.begin();
    Serial.println("BH1750 Light Sensor Initialized");
    
    // Initialize WiFi
    initializeWiFi();
    
    // Setup MQTT
    if (WiFi.status() == WL_CONNECTED) {
        setupMQTT();
        connectToMQTT();
    }
    
    Serial.println("Pin Configuration:");
    Serial.printf("DHT Sensor Pin: %d\n", DHTPIN);
    Serial.printf("Window Open Relay: %d\n", WINDOW_OPEN_RELAY);
    Serial.printf("Window Close Relay: %d\n", WINDOW_CLOSE_RELAY);
    Serial.printf("Fan Relay: %d\n", FAN_RELAY);
    Serial.printf("LED Relay: %d\n", LED_RELAY);
    Serial.println("==============================");
    
    // Initialize timing
    lastSensorRead = millis();
    lastAPICall = millis();
    lastLoginAttempt = millis();
    lastMqttReconnect = millis();
    
    // Attempt initial authentication
    Serial.println("Attempting initial authentication...");
    authenticateUser();

    updateControlPanelState();
    
    Serial.println("System ready!");
}

void loop() {
    unsigned long currentTime = millis();
    
    // Handle MQTT connection and messages
    if (WiFi.status() == WL_CONNECTED) {
        if (!mqttClient.connected()) {
            if (currentTime - lastMqttReconnect >= MQTT_RECONNECT_INTERVAL) {
                connectToMQTT();
                lastMqttReconnect = currentTime;
            }
        } else {
            mqttClient.loop();  // Process incoming MQTT messages
        }
    }
    
    // Read sensors at specified interval
    if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
        Serial.println("Reading sensors...");
        
        float temperature = tempSensor.readTemperature();
        float humidity = tempSensor.readHumidity();
        float lightLevel = lightMeter.readLightLevel();
        
        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("ERROR: DHT sensor reading failed!");
            delay(1000);
            return;
        }
        
        if (lightLevel < 0) {
            Serial.println("ERROR: Light sensor reading failed!");
            lightLevel = 0; // Set default value
        }
        
        // Print current data to console
        printSystemStatus(temperature, humidity, lightLevel);
        
        // Control systems based on sensor readings
        controlSystems(temperature, humidity, lightLevel);
        
        // Send data to API at specified interval
        if (currentTime - lastAPICall >= API_INTERVAL) {
            sendDataToAPI(temperature, humidity, lightLevel);
            lastAPICall = currentTime;
        }
        
        lastSensorRead = currentTime;
    }
    
    delay(100); // Small delay to prevent excessive CPU usage
}