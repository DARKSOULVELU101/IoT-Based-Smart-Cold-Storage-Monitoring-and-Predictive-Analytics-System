# Wokwi Cold Storage Simulation

## Open in Wokwi

1. Open https://wokwi.com/projects/new/esp32
2. Replace the generated `sketch.ino` with this package's `sketch.ino`.
3. Open `diagram.json` in Wokwi and replace its content with this package's `diagram.json`.
4. Open Library Manager, add the libraries listed in `libraries.txt`, and start the simulation.
5. Use the DHT22 controls to change temperature/humidity.
6. Toggle the switches to simulate an open door and power failure.
7. Rotate the potentiometers to simulate gas leakage and compressor current.

## Expected output

- OLED continuously displays temperature, humidity, door, power, and risk.
- Green, yellow, and red LEDs represent safe, warning, and critical states.
- Blue LED represents the compressor.
- The buzzer sounds for critical conditions.
- JSON telemetry appears in Serial Monitor every 10 seconds.

## Backend integration

Deploy a public HTTPS endpoint accepting `POST /api/readings`, then replace:

```cpp
const char* API_URL = "https://your-backend.example.com/api/readings";
```

Never place a permanent private API key in a public Wokwi project. The included `setInsecure()` is acceptable only for a prototype; production firmware should validate TLS certificates.

## Important switch behaviour

- Door switch connected state: door open.
- Power switch disconnected/default state: power available because GPIO 5 uses `INPUT_PULLUP`.
- Switch power toward ground to simulate failure.
