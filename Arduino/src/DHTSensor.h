#ifndef DHTSENSOR_H
#define DHTSENSOR_H

#include <DHT.h>

class DHTSensor {
private:
  DHT dht;
  
public:
  DHTSensor(uint8_t pin, uint8_t type);
  void begin();
  float readTemperature();
  float readHumidity();
};

#endif
