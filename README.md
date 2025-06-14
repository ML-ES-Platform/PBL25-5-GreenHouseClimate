# PBL25-5-GreenHouseClime
# Smart Environmental Control System with ESP32, Spring Boot, and Web Dashboard

This project is a full-stack IoT system for environmental monitoring and actuator control using an ESP32 microcontroller, real-time sensor data collection, a Spring Boot backend, and an interactive HTML+JS frontend.

---

## 📦 Project Overview

### ✨ Features
- Real-time monitoring of **humidity**, **temperature**, and **light levels**
- Remote control of:
  - 🔄 Linear actuator motor (via 2 relays)
  - 🌬️ DC fan
  - 💡 LED
- Sensor data stored in a **MySQL** database
- RESTful API built with **Spring Boot**
- Frontend with:
  - 📈 Historical charts using Chart.js
  - 🟢 Live status indicators
  - 🔘 Control buttons for actuators
- Secure login with **JWT authentication**

---

## 🔌 Hardware Setup (ESP32)

### Components
- ESP32 Dev Board
- 4-Channel Relay Module
- DHT11 Sensor (humidity + temperature)
- Light Sensor (e.g. LDR or module)
- Linear Actuator (12V, 2-relay control)
- DC Fan (12V)
- LED with 220Ω resistor
- 12V Power Supply

### Wiring Summary

#### Relays (controlled by ESP32)
| Device            | ESP32 Pin | Relay Channel |
|------------------|-----------|---------------|
| Linear Motor A    | GPIO16    | Relay 1       |
| Linear Motor B    | GPIO17    | Relay 2       |
| DC Fan           | GPIO18    | Relay 3       |
| LED              | GPIO19    | Relay 4       |

#### Sensors
- **DHT11**: Connected to digital pin (e.g., GPIO21)
- **Light Sensor**: Connected to analog pin (e.g., GPIO34)

#### Power
- All relays and actuators powered from 12V supply
- ESP32 powered via USB or buck converter
- **Common Ground** shared between 12V supply and ESP32

> **Important:** Do not activate both motor relays at once. Control motor direction by toggling one at a time.

---

## ⚙️ Backend Setup (Spring Boot + MySQL)

### Features
- MQTT listener for data from ESP32
- REST API for frontend to:
  - Get latest sensor values
  - Fetch historical data for charts
  - Toggle actuators via API calls
- JWT-based user authentication
- MySQL for persistent data storage

### Setup Steps
1. Create `.env` or `application.properties` file:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/iot_db
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   jwt.secret=your_jwt_secret
   mqtt.broker=tcp://broker.hivemq.com:1883
   mqtt.topic=sensor/data


2. Run with Maven or your IDE:

   ```bash
   mvn spring-boot:run
   ```

3. Backend listens to sensor data via MQTT and provides APIs for frontend.

---

## 🌐 Frontend Overview

### Tech Stack

* Pure HTML + JavaScript
* Chart.js for data visualization
* Fetch API for communication with backend
* JWT login system

### Features

* 📊 Charts for temperature, humidity, and light over time
* 🔘 Buttons to toggle:

    * Linear Motor (Forward/Reverse)
    * Fan ON/OFF
    * LED ON/OFF
* 🟢 Real-time status indicators
* 🔐 Login & logout functionality (JWT stored in browser)

---

## 📡 Communication Flow

![img.png](img.png)

---

## 🛠️ Running the System

1. **Power your hardware**
2. **Flash ESP32 firmware**
3. **Start Spring Boot server**
4. **Serve `index.html` frontend in browser**
5. **Log in and interact with the system!**

---

## 🧪 Future Improvements

* Add more sensors (CO2, soil moisture, etc.)
* Improve actuator safety logic
* Expand frontend UI with graphs and mobile support
* Add email notifications or alert system

---

## 📁 Repository Structure

```
/arduino/
    main.ino         → ESP32 firmware
/backend/
    src/             → Spring Boot Java code
/frontend/
    index.html       → UI page
    scripts.js       → Frontend logic
    style.css        → Styling
README.md            → You're here
```

---

## 📜 License

MIT License. Free to use and modify.

---

## 👨‍💻 Author

Created by team 5 FAF-223
Bujilov Dmitrii
Ciornii Alexandr
Cravcenco Dmitrii
Nedealcova Irina




