#include "NetworkClient.h"

// Constructor
NetworkClient::NetworkClient() : wifiConnected(false), headerCount(0) {
  userAgent = "ESP32-Client";
  timeout = 10000;
}

// WiFi Management
bool NetworkClient::connectWiFi(const char* ssid, const char* password, int maxRetries) {
  Serial.println("Connecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < maxRetries) {
    delay(1000);
    Serial.print(".");
    retries++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println();
    Serial.println("WiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    return true;
  } else {
    wifiConnected = false;
    Serial.println();
    Serial.println("Failed to connect to WiFi!");
    return false;
  }
}

bool NetworkClient::isWiFiConnected() {
  wifiConnected = (WiFi.status() == WL_CONNECTED);
  return wifiConnected;
}

void NetworkClient::disconnectWiFi() {
  WiFi.disconnect();
  wifiConnected = false;
  Serial.println("WiFi disconnected");
}

String NetworkClient::getLocalIP() {
  if (isWiFiConnected()) {
    return WiFi.localIP().toString();
  }
  return "Not connected";
}

// Internal helper methods
void NetworkClient::addHeaders() {
  http.addHeader("User-Agent", userAgent);
  
  for (int i = 0; i < headerCount; i++) {
    if (headers[i].active) {
      http.addHeader(headers[i].name, headers[i].value);
    }
  }
}

void NetworkClient::logRequest(const String& method, const String& url) {
  Serial.println("\n--- HTTP Request ---");
  Serial.print("Method: ");
  Serial.println(method);
  Serial.print("URL: ");
  Serial.println(url);
  Serial.print("User-Agent: ");
  Serial.println(userAgent);
}

void NetworkClient::logResponse(const HttpResponse& response) {
  Serial.println("\n--- HTTP Response ---");
  Serial.print("Status Code: ");
  Serial.println(response.statusCode);
  Serial.print("Success: ");
  Serial.println(response.success ? "Yes" : "No");
  
  if (!response.success && !response.errorMessage.isEmpty()) {
    Serial.print("Error: ");
    Serial.println(response.errorMessage);
  }
  
  if (!response.body.isEmpty()) {
    Serial.println("Response Body:");
    Serial.println(response.body);
  }
}

// HTTP Methods
HttpResponse NetworkClient::get(const String& url) {
  HttpResponse response;
  
  if (!isWiFiConnected()) {
    response.success = false;
    response.errorMessage = "WiFi not connected";
    response.statusCode = -1;
    return response;
  }
  
  if (!isValidUrl(url)) {
    response.success = false;
    response.errorMessage = "Invalid URL";
    response.statusCode = -1;
    return response;
  }
  
  logRequest("GET", url);
  
  http.begin(url);
  http.setTimeout(timeout);
  addHeaders();
  
  int httpCode = http.GET();
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.body = http.getString();
    response.success = (httpCode >= 200 && httpCode < 300);
    
    if (!response.success) {
      response.errorMessage = "HTTP Error " + String(httpCode);
    }
  } else {
    response.success = false;
    response.errorMessage = "Connection failed: " + String(httpCode);
  }
  
  http.end();
  logResponse(response);
  return response;
}

HttpResponse NetworkClient::post(const String& url, const String& payload) {
  HttpResponse response;
  
  if (!isWiFiConnected()) {
    response.success = false;
    response.errorMessage = "WiFi not connected";
    response.statusCode = -1;
    return response;
  }
  
  logRequest("POST", url);
  Serial.print("Payload: ");
  Serial.println(payload);
  
  http.begin(url);
  http.setTimeout(timeout);
  addHeaders();
  
  int httpCode = http.POST(payload);
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.body = http.getString();
    response.success = (httpCode >= 200 && httpCode < 300);
    
    if (!response.success) {
      response.errorMessage = "HTTP Error " + String(httpCode);
    }
  } else {
    response.success = false;
    response.errorMessage = "Connection failed: " + String(httpCode);
  }
  
  http.end();
  logResponse(response);
  return response;
}

HttpResponse NetworkClient::put(const String& url, const String& payload) {
  HttpResponse response;
  
  if (!isWiFiConnected()) {
    response.success = false;
    response.errorMessage = "WiFi not connected";
    response.statusCode = -1;
    return response;
  }
  
  logRequest("PUT", url);
  
  http.begin(url);
  http.setTimeout(timeout);
  addHeaders();
  
  int httpCode = http.PUT(payload);
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.body = http.getString();
    response.success = (httpCode >= 200 && httpCode < 300);
  } else {
    response.success = false;
    response.errorMessage = "Connection failed: " + String(httpCode);
  }
  
  http.end();
  logResponse(response);
  return response;
}

HttpResponse NetworkClient::patch(const String& url, const String& payload) {
  HttpResponse response;
  
  if (!isWiFiConnected()) {
    response.success = false;
    response.errorMessage = "WiFi not connected";
    response.statusCode = -1;
    return response;
  }
  
  logRequest("PATCH", url);
  
  http.begin(url);
  http.setTimeout(timeout);
  addHeaders();
  
  int httpCode = http.PATCH(payload);
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.body = http.getString();
    response.success = (httpCode >= 200 && httpCode < 300);
  } else {
    response.success = false;
    response.errorMessage = "Connection failed: " + String(httpCode);
  }
  
  http.end();
  logResponse(response);
  return response;
}

HttpResponse NetworkClient::del(const String& url) {
  HttpResponse response;
  
  if (!isWiFiConnected()) {
    response.success = false;
    response.errorMessage = "WiFi not connected";
    response.statusCode = -1;
    return response;
  }
  
  logRequest("DELETE", url);
  
  http.begin(url);
  http.setTimeout(timeout);
  addHeaders();
  
  // HTTPClient doesn't have a DELETE method, so we use sendRequest
  int httpCode = http.sendRequest("DELETE");
  response.statusCode = httpCode;
  
  if (httpCode > 0) {
    response.body = http.getString();
    response.success = (httpCode >= 200 && httpCode < 300);
  } else {
    response.success = false;
    response.errorMessage = "Connection failed: " + String(httpCode);
  }
  
  http.end();
  logResponse(response);
  return response;
}

// JSON Helper Methods
HttpResponse NetworkClient::postJson(const String& url, const DynamicJsonDocument& jsonDoc) {
  String payload;
  serializeJson(jsonDoc, payload);
  
  // Add JSON content type header temporarily
  addHeader("Content-Type", "application/json");
  
  HttpResponse response = post(url, payload);
  
  // Remove the temporary header
  removeHeader("Content-Type");
  
  return response;
}

HttpResponse NetworkClient::putJson(const String& url, const DynamicJsonDocument& jsonDoc) {
  String payload;
  serializeJson(jsonDoc, payload);
  
  addHeader("Content-Type", "application/json");
  HttpResponse response = put(url, payload);
  removeHeader("Content-Type");
  
  return response;
}

DynamicJsonDocument NetworkClient::parseJsonResponse(const String& jsonString, size_t capacity) {
  DynamicJsonDocument doc(capacity);
  
  DeserializationError error = deserializeJson(doc, jsonString);
  
  if (error) {
    Serial.print("JSON parsing failed: ");
    Serial.println(error.c_str());
    doc.clear(); // Return empty document on error
  }
  
  return doc;
}

// Configuration methods
void NetworkClient::setUserAgent(const String& newUserAgent) {
  userAgent = newUserAgent;
}

void NetworkClient::setTimeout(int newTimeout) {
  timeout = newTimeout;
}

void NetworkClient::addHeader(const String& name, const String& value) {
  // First, try to find if header already exists and update it
  for (int i = 0; i < headerCount; i++) {
    if (headers[i].active && headers[i].name.equalsIgnoreCase(name)) {
      headers[i].value = value;
      return;
    }
  }
  
  // If not found and we have space, add new header
  if (headerCount < MAX_HEADERS) {
    headers[headerCount] = HttpHeader(name, value);
    headerCount++;
  } else {
    Serial.println("Warning: Maximum headers reached, cannot add: " + name);
  }
}

void NetworkClient::removeHeader(const String& name) {
  for (int i = 0; i < headerCount; i++) {
    if (headers[i].active && headers[i].name.equalsIgnoreCase(name)) {
      // Shift remaining headers down
      for (int j = i; j < headerCount - 1; j++) {
        headers[j] = headers[j + 1];
      }
      headerCount--;
      break;
    }
  }
}

void NetworkClient::clearHeaders() {
  for (int i = 0; i < MAX_HEADERS; i++) {
    headers[i].active = false;
  }
  headerCount = 0;
}

// Utility Methods
bool NetworkClient::isValidUrl(const String& url) {
  return (url.startsWith("http://") || url.startsWith("https://"));
}

String NetworkClient::urlEncode(const String& str) {
  String encoded = "";
  char c;
  char code0;
  char code1;
  
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (c == ' ') {
      encoded += '+';
    } else if (isalnum(c)) {
      encoded += c;
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) {
        code1 = (c & 0xf) - 10 + 'A';
      }
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) {
        code0 = c - 10 + 'A';
      }
      encoded += '%';
      encoded += code0;
      encoded += code1;
    }
  }
  return encoded;
}

// Destructor
NetworkClient::~NetworkClient() {
  http.end();
}