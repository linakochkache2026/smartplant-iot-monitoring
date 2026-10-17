# SmartPlant — IoT Plant Monitoring and Smart Irrigation

## Overview

SmartPlant is an IoT project designed to monitor plant-growing conditions and simulate an automatic irrigation system. It combines an ESP32-based circuit, environmental measurements, cloud data storage, and a web dashboard.

The project demonstrates how sensor data can be collected, transmitted to a cloud platform, and visualized through a web interface.

**Project status:** Functional prototype with a simulated circuit and irrigation indicator.

## Features

- Soil moisture level simulation using a potentiometer.
- Air temperature and relative humidity monitoring using a DHT22 sensor.
- Automatic irrigation logic based on soil moisture thresholds.
- LED indicator simulating the pump state.
- Data transmission to ThingSpeak.
- React dashboard displaying measurements and charts.
- Periodic data refresh from ThingSpeak.

## System Architecture

The project follows this data flow:

ESP32 in Wokwi → Wi-Fi simulation → ThingSpeak Cloud → React Dashboard

1. The ESP32 reads the simulated soil moisture value and the DHT22 measurements.
2. The program determines whether irrigation should be activated.
3. Measurements are sent to ThingSpeak through an HTTP request.
4. ThingSpeak stores the measurements in channel fields.
5. The React dashboard retrieves and displays the available data.

## Hardware and Simulation

- ESP32 development board
- DHT22 temperature and humidity sensor
- Potentiometer simulating soil moisture
- LED and 220 Ω resistor simulating the irrigation pump indicator
- Wokwi online simulator

**Important:** Soil moisture is simulated using a potentiometer. The prototype does not currently use a real soil moisture sensor or a physical water pump.

## Technologies

- C++ / Arduino framework
- ESP32
- Wokwi
- Wi-Fi and HTTP
- ThingSpeak IoT Cloud
- React
- JavaScript
- Vite
- Recharts
- Lucide React

## ThingSpeak Configuration

The ThingSpeak channel uses four fields:

| Field | Measurement |
|---|---|
| Field 1 | Soil moisture (%) — simulated |
| Field 2 | Air temperature (°C) |
| Field 3 | Relative air humidity (%) |
| Field 4 | Pump indicator state (0 = OFF, 1 = ON) |

The ESP32 uploads measurements periodically. The dashboard reads the channel data and refreshes its displayed measurements.

## Irrigation Logic

The prototype uses two thresholds to avoid switching the irrigation indicator at every small change:

- Soil moisture below 30%: turn the pump indicator ON.
- Soil moisture at or above 40%: turn the pump indicator OFF.
- Between 30% and 40%: retain the previous state.

These thresholds are used for the simulation and may need calibration for a real soil sensor and plant.

## Getting Started

### 1. Run the web dashboard

Requirements: Node.js and npm.

Clone or download this repository, then open a terminal in the project folder.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

On Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if PowerShell blocks `npm.ps1`.

Open the local URL displayed by Vite, usually `http://localhost:5173/`.

### 2. Connect ThingSpeak

1. Create a ThingSpeak channel with the four fields listed above.
2. Configure the channel ID in `src/App.jsx`.
3. For this frontend-only demonstration, make the channel public so the dashboard can read the feeds without exposing a private read key.
4. Verify that the channel contains incoming data.

Never place the ThingSpeak Write API Key in the React frontend or commit it to a public repository.

### 3. Run the ESP32 simulation

1. Open the Wokwi circuit.
2. Configure the ThingSpeak Write API Key locally in the ESP32 sketch.
3. Start the simulation.
4. Monitor the serial output and verify that ThingSpeak receives new measurements.

Use a placeholder instead of a real API key in any code published in this repository.

## Project Structure

```text
smartplant-dashboard/
├── esp32-wokwi/
│   ├── sketch.ino
│   ├── diagram.json
│   └── libraries.txt
├── src/
├── public/
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Limitations and Future Improvements

- Replace the potentiometer with a real soil moisture sensor.
- Control a real pump using an appropriate driver or relay and electrical protection.
- Calibrate the moisture readings with the real sensor.
- Improve error handling and connectivity monitoring.
- Add alerts for low soil moisture.
- Store credentials securely if private cloud data is required.
- Deploy the dashboard online.

## Author

## Author

**[lina kochkach]** — Computer Engineering Student

GitHub: [Your GitHub username](https://github.com/linakochkache2026)

This project was developed to explore IoT, embedded systems, cloud connectivity, and web-based data visualization.
