#include "Control.h"

Control::Control(float setPoint, float hysteresis) {
  this->setPoint = setPoint;
  this->hysteresis = hysteresis;
}

bool Control::updateControl(float currentTemperature, bool currentRelayState) {
  if (!currentRelayState && currentTemperature < (setPoint - hysteresis)) {
    return true;  // Turn ON
  } else if (currentRelayState && currentTemperature > (setPoint + hysteresis)) {
    return false; // Turn OFF
  }
  
  return currentRelayState;
}
