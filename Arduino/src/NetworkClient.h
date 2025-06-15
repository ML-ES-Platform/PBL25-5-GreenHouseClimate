#ifndef NETWORKCLIENT_H
#define NETWORKCLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Maximum number of custom headers
#define MAX_HEADERS 10

// HTTP Response structure
struct HttpResponse {
  int statusCode;
  String body;
  bool success;
  String errorMessage;
};

// Simple header structure
struct HttpHeader {
  String name;
  String value;
  bool active;
  
  HttpHeader() : active(false) {}
  HttpHeader(const String& n, const String& v) : name(n), value(v), active(true) {}
};

class NetworkClient {
private:
  HTTPClient http;
  bool wifiConnected;
  
  // Configuration
  String userAgent;
  int timeout;
  HttpHeader headers[MAX_HEADERS];
  int headerCount;
  
  // Internal helper methods
  void addHeaders();
  void logRequest(const String& method, const String& url);
  void logResponse(const HttpResponse& response);

public:
  // Constructor
  NetworkClient();
  
  // WiFi Management
  bool connectWiFi(const char* ssid, const char* password, int maxRetries = 20);
  bool isWiFiConnected();
  void disconnectWiFi();
  String getLocalIP();
  
  // HTTP Methods
  HttpResponse get(const String& url);
  HttpResponse post(const String& url, const String& payload);
  HttpResponse put(const String& url, const String& payload);
  HttpResponse patch(const String& url, const String& payload);
  HttpResponse del(const String& url); // 'delete' is a reserved keyword
  
  // JSON Helper Methods
  HttpResponse postJson(const String& url, const DynamicJsonDocument& jsonDoc);
  HttpResponse putJson(const String& url, const DynamicJsonDocument& jsonDoc);
  DynamicJsonDocument parseJsonResponse(const String& jsonString, size_t capacity = 2048);
  
  // Configuration
  void setUserAgent(const String& userAgent);
  void setTimeout(int timeout);
  void addHeader(const String& name, const String& value);
  void removeHeader(const String& name);
  void clearHeaders();
  
  // Utility Methods
  bool isValidUrl(const String& url);
  String urlEncode(const String& str);
  
  // Destructor
  ~NetworkClient();
};

#endif