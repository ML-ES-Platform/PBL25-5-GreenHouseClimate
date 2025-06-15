#ifndef RELAYDRIVER_H
#define RELAYDRIVER_H

#include <Arduino.h>

class RelayDriver {
public:
  static void setup(uint8_t pin);
  static void setOutput(uint8_t pin, uint8_t state);
};

#endif
