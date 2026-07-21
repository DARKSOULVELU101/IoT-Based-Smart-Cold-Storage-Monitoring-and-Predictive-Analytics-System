# Sensor Specifications

## DHT22 (Temperature & Humidity)
- **Model**: DHT22 (AM2302)
- **Interface**: Digital (Single-wire)
- **GPIO**: 15
- **Temperature Range**: -40°C to 80°C
- **Temperature Accuracy**: ±0.5°C
- **Humidity Range**: 0-100% RH
- **Humidity Accuracy**: ±2-5% RH
- **Sampling Rate**: 1 Hz (minimum 2s between reads)
- **Operating Voltage**: 3.3V - 5V
- **Cold Storage Safe Range**: 2°C - 8°C
- **Max Humidity**: 70%

## Door Switch
- **Type**: Slide Switch (SPDT)
- **GPIO**: 4 (INPUT_PULLUP)
- **Logic**: LOW = Door Open, HIGH = Door Closed
- **Alert Threshold**: Open for > 15 seconds
- **Wiring**: Pin 1 to GND, Pin 2 to GPIO 4

## Power Switch
- **Type**: Slide Switch (SPDT)
- **GPIO**: 5 (INPUT_PULLUP)
- **Logic**: LOW = Power Failure, HIGH = Power Available
- **Default**: Power ON (pull-up resistor)
- **Wiring**: Pin 1 to GND, Pin 2 to GPIO 5

## Gas Sensor (Potentiometer)
- **Type**: Potentiometer (simulating MQ-135)
- **GPIO**: 34 (ADC, input-only)
- **ADC Range**: 0 - 4095
- **Safe Range**: 0 - 2600
- **Alert Threshold**: > 2600 (Gas Leak)
- **Operating Voltage**: 3.3V

## Current Sensor (Potentiometer)
- **Type**: Potentiometer (simulating ACS712)
- **GPIO**: 35 (ADC, input-only)
- **ADC Range**: 0 - 4095
- **Current Calculation**: ADC × 10.0 / 4095.0 = 0-10A
- **Normal Range**: 0 - 8A
- **Warning Threshold**: > 8A (High Compressor Current)

## SSD1306 OLED Display
- **Model**: SSD1306 128x64
- **Interface**: I2C
- **I2C Address**: 0x3C
- **SDA**: GPIO 21
- **SCL**: GPIO 22
- **Operating Voltage**: 3.3V
- **Display Content**: Temperature, Humidity, Door, Power, Risk Score

## Status LEDs
| LED | GPIO | Color | Meaning |
|-----|------|-------|---------|
| Compressor | 18 | Blue | Compressor running |
| Safe | 19 | Green | Risk < 30 |
| Warning | 23 | Yellow | Risk 30-59 |
| Critical | 25 | Red | Risk >= 60 or fault |

## Buzzer
- **GPIO**: 26
- **Trigger**: Risk >= 60 or critical fault
- **Frequency**: 1000 Hz
- **Volume**: 0.15 (Wokwi simulation)

## Risk Score Calculation (0-100)
| Component | Max Points | Trigger |
|-----------|-----------|---------|
| Temperature | 40 | Deviation from 2-8°C range |
| Humidity | 20 | Above 70% |
| Door | 15 | Open duration in seconds |
| Power | 15 | Power unavailable |
| Gas | 10 | Above 2600 ADC |
| Current | 10 | Above 8A |

### Status Thresholds
- 0-29: SAFE
- 30-59: WARNING
- 60-79: HIGH RISK
- 80-100: CRITICAL
