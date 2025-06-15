#ifndef CONTROL_H
#define CONTROL_H

class Control {
private:
  float setPoint;
  float hysteresis;
  
public:
  Control(float setPoint, float hysteresis);
  bool updateControl(float currentTemperature, bool currentRelayState);
};

#endif
