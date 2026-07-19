# Master Prompt for Generating the Wokwi Hardware Simulation

Act as a senior Embedded Systems, IoT, Wokwi, and Arduino C++ engineer. Create a complete, executable Wokwi Cloud simulation named **IoT Cold Storage Monitoring and Spoilage-Risk Analytics System**. The result must run without physical hardware and must be suitable for integration with a hosted software dashboard.

Use an ESP32 DevKit V1 and only Wokwi-supported components. Provide the complete contents of `sketch.ino`, `diagram.json`, and `libraries.txt`. Do not provide pseudocode, omit file sections, invent component identifiers, or leave compile errors.

Hardware requirements:

- DHT22 on GPIO 15 for temperature and humidity.
- Door slide switch on GPIO 4 using `INPUT_PULLUP`; grounded means open.
- Power-failure slide switch on GPIO 5 using `INPUT_PULLUP`; grounded means failure.
- Potentiometer on GPIO 34 representing gas level from 0–4095.
- Potentiometer on GPIO 35 representing compressor current from 0–10 A.
- Blue compressor-status LED on GPIO 18.
- Green safe LED on GPIO 19.
- Yellow warning LED on GPIO 23.
- Red critical LED on GPIO 25.
- Buzzer on GPIO 26.
- SSD1306 128x64 I2C OLED at address 0x3C, SDA GPIO 21 and SCL GPIO 22.

Firmware behaviour:

1. Connect to Wi-Fi using SSID `Wokwi-GUEST` with an empty password.
2. Read all inputs once per second without blocking network operations unnecessarily.
3. Use a safe temperature range of 2–8°C and maximum humidity of 70%.
4. Turn the simulated compressor on above 8°C and off at or below 2°C.
5. Raise a door alert after it remains open for 15 seconds.
6. Raise a gas alert above ADC value 2600, power alert when power is absent, and maintenance warning above simulated current 8 A.
7. Calculate a transparent 0–100 spoilage-risk score using temperature deviation, humidity deviation, door duration, power failure, gas level, and abnormal current.
8. Show the readings, power/door states, risk score, and status on the OLED.
9. Operate safe, warning, critical LEDs and buzzer according to status.
10. Every 10 seconds print valid JSON telemetry and optionally POST the same JSON to a configurable public HTTPS REST endpoint.
11. JSON fields must include deviceId, zone, temperature, humidity, doorOpen, doorOpenSeconds, powerAvailable, gasLevel, compressorCurrent, compressorOn, riskScore, and status.
12. If the endpoint is still a placeholder, skip HTTP safely while continuing Serial output.
13. Reconnect Wi-Fi safely after disconnection and continue local monitoring when offline.

Use the current ArduinoJson API, Adafruit DHT, Adafruit GFX, and Adafruit SSD1306 libraries. Include meaningful Serial messages and comments. Ensure every pin used in the code exactly matches `diagram.json`. Finish with short instructions explaining how to create a new ESP32 project on Wokwi, paste each file, install the libraries, run the simulation, adjust inputs, and replace the backend API URL.
