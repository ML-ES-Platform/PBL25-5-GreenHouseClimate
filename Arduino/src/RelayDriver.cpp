#include "RelayDriver.h"

void RelayDriver::setup(uint8_t pin) {
  pinMode(pin, OUTPUT);
}

void RelayDriver::setOutput(uint8_t pin, uint8_t state) {
  digitalWrite(pin, state);
}
