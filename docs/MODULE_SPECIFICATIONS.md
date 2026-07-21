# Module Specifications - IoT Analytics Suite

## Module 1: Cold Storage Monitoring

### Purpose
Real-time monitoring of refrigerated storage environments to ensure food and pharmaceutical safety compliance.

### Sensors

| Sensor | Type | Range | Accuracy | Read Interval |
|--------|------|-------|----------|---------------|
| DHT22 | Temperature | -40C to 80C | +/- 2C | 1 second |
| DHT22 | Humidity | 0-100% RH | +/- 5% | 1 second |
| MQ-136 | Gas Level | 0-4095 ADC | - | 1 second |
| ACS712 | Compressor Current | 0-10A | +/- 0.1A | 1 second |
| Slide Switch | Door State | Open/Closed | Digital | 1 second |
| Slide Switch | Power State | On/Off | Digital | 1 second |

### Thresholds

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| Temperature | 2.0C - 8.0C | 8.0C - 12.0C | > 12.0C or < 0C |
| Humidity | < 70% | 70% - 85% | > 85% |
| Gas Level | < 2600 | - | > 2600 |
| Compressor Current | < 8.0A | 8.0A - 9.0A | > 9.0A |
| Door Open Duration | < 15s | 15s - 30s | > 30s |
| Power | Available | - | Failure |

### Risk Score Calculation (0-100)

```
Temperature Risk:  (temp > MAX_TEMP) ? (temp - MAX_TEMP) * 10 : (MIN_TEMP - temp) * 10
                   Clamped to 0-40 points

Humidity Risk:     (humidity > MAX_HUMIDITY) ? (humidity - MAX_HUMIDITY) * 1.5 : 0
                   Clamped to 0-20 points

Door Risk:         door_open ? clamp(doorSeconds, 0, 15) : 0
                   0-15 points

Power Risk:        powerAvailable ? 0 : 15
                   0 or 15 points

Gas Risk:          gasLevel > 2600 ? 10 : 0
                   0 or 10 points

Current Risk:      compressorCurrent > 8.0 ? 10 : 0
                   0 or 10 points

Total Risk = temperatureRisk + humidityRisk + doorRisk + powerRisk + gasRisk + currentRisk
             Clamped to 0-100
```

### Status Mapping

| Risk Score | Status | LED | Buzzer |
|------------|--------|-----|--------|
| 0 - 29 | SAFE | Green | Off |
| 30 - 59 | WARNING | Yellow | Off |
| 60 - 79 | HIGH RISK | Red | Off |
| 80 - 100 | CRITICAL | Red | On (1000Hz) |

### Alert Types

| Alert Type | Severity | Trigger |
|------------|----------|---------|
| HIGH_TEMPERATURE | warning/critical | Temperature > 8C |
| LOW_TEMPERATURE | warning | Temperature < 2C |
| HIGH_HUMIDITY | warning | Humidity > 70% |
| DOOR_LEFT_OPEN | warning | Door open > 15s |
| GAS_LEAK_DETECTED | critical | Gas level > 2600 |
| HIGH_CURRENT | warning | Current > 8A |
| POWER_FAILURE | critical | Power unavailable |
| COMPRESSOR_FAULT | warning | Current > 9A |
| RISK_LEVEL_CRITICAL | critical | Risk score >= 80 |

### Compliance Standards

- **FDA 21 CFR Part 11**: Temperature monitoring for food safety
- **HACCP**: Critical Control Point monitoring
- **GDP**: Good Distribution Practice for pharmaceuticals
- Temperature logs retained for audit trail
- Automated compliance report generation

---

## Module 2: Machine Health Monitoring

### Purpose
Predictive maintenance monitoring for industrial machinery to prevent unexpected failures.

### Sensors

| Sensor | Type | Range | Accuracy | Read Interval |
|--------|------|-------|----------|---------------|
| DHT22 | Motor Temperature | -40C to 80C | +/- 2C | 1 second |
| SW-420 | Vibration | 0-4095 ADC | - | 1 second |
| ACS712 | Motor Current | 0-10A | +/- 0.1A | 1 second |
| ZMPT101B | Supply Voltage | 0-300V | +/- 1V | 1 second |

### Thresholds

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| Motor Temperature | < 50C | 50C - 70C | > 70C |
| Vibration | < 2048 | 2048 - 3072 | > 3072 |
| Motor Current | < 7.0A | 7.0A - 9.0A | > 9.0A |
| Supply Voltage | 200V - 250V | 180V-200V or 250V-270V | < 180V or > 270V |

### Health Score Calculation (0-100)

```
Temperature Score:  100 at 50C, 0 at 70C (linear)
Vibration Score:    100 at 2048, 0 at 3072 (linear)
Current Score:      100 at 7A, 0 at 9A (linear)
Voltage Score:      100 within 200-250V, decreases with deviation

Health Score = TempScore * 0.30 + VibScore * 0.30 + CurScore * 0.25 + VolScore * 0.15
               Clamped to 0-100
```

### Status Mapping

| Health Score | Status | LED | Relay |
|--------------|--------|-----|-------|
| >= 80 | NORMAL | Green | ON (machine running) |
| 50 - 79 | WARNING | Yellow | ON |
| < 50 | CRITICAL | Red | OFF (safety shutdown) |

### Alert Types

| Alert Type | Severity | Trigger |
|------------|----------|---------|
| MOTOR_OVERHEAT | warning/critical | Temp > 50C |
| HIGH_VIBRATION | warning/critical | Vibration > 2048 |
| HIGH_CURRENT | warning/critical | Current > 7A |
| VOLTAGE_ANOMALY | warning | Voltage outside 200-250V |
| BEARING_WEAR | warning | Vibration trend increasing |
| PREDICTIVE_FAILURE | critical | ML model predicts failure > 70% |
| SAFETY_SHUTDOWN | critical | Health score < 50 |

### Predictive Analytics

- **Isolation Forest**: Anomaly detection for sensor patterns
- **Linear Regression**: Trend prediction for health score
- **Failure Probability**: ML-calculated probability of failure within 24h
- **Recommended Actions**: AI-generated maintenance suggestions

### Maintenance Triggers

| Condition | Recommended Action |
|-----------|-------------------|
| Vibration > 2048 for 1 hour | Inspect bearings |
| Temperature > 50C for 30 min | Check cooling system |
| Current > 7A for 15 min | Inspect load balance |
| Health score < 50 | Emergency maintenance |

---

## Module 3: Water Quality Monitoring

### Purpose
Continuous monitoring of water treatment and distribution systems.

### Sensors

| Sensor | Type | Range | Accuracy | Read Interval |
|--------|------|-------|----------|---------------|
| DHT22 | Water Temperature | -40C to 80C | +/- 2C | 1 second |
| pH Probe | Acidity/Alkalinity | 0-14 pH | +/- 0.1 | 1 second |
| TDS Sensor | Total Dissolved Solids | 0-1000+ ppm | +/- 10% | 1 second |
| Turbidity | Water Clarity | 0-100 NTU | +/- 5% | 1 second |
| Chlorine | Free Chlorine | 0-5 mg/L | +/- 0.1 | 1 second |
| Flow Sensor | Flow Rate | 0-10 L/min | +/- 5% | 1 second |
| Ultrasonic | Water Level | 0-100% | +/- 1% | 1 second |

### Thresholds

| Parameter | Safe Range | Warning | Critical |
|-----------|-----------|---------|----------|
| pH | 6.5 - 8.5 | 6.0-6.5 or 8.5-9.0 | < 6.0 or > 9.0 |
| TDS | < 500 ppm | 500 - 1000 ppm | > 1000 ppm |
| Turbidity | < 5 NTU | 5 - 10 NTU | > 10 NTU |
| Chlorine | 0.5 - 2.0 mg/L | 0.2-0.5 or 2.0-4.0 | < 0.2 or > 4.0 |
| Water Level | > 20% | 10% - 20% | < 10% |
| Flow Rate | > 0 L/min | - | 0 L/min |
| Temperature | 5C - 35C | 35C - 40C | > 40C or < 5C |

### Quality Score Calculation (0-100)

```
pH Score:       100 within 6.5-8.5, decreases with deviation
TDS Score:      100 at 0ppm, 0 at 1000ppm (linear)
Level Score:    100 above 20%, decreases below
Flow Score:     100 if flow > 0, else 0
Temperature Score: 100 within 5-35C, decreases with deviation

Quality Score = pHScore * 0.30 + TDSScore * 0.30 + LevelScore * 0.20 + FlowScore * 0.10 + TempScore * 0.10
                Clamped to 0-100
```

### Contamination Risk

| Risk Level | Condition |
|------------|-----------|
| LOW | pH in range AND TDS < 1000 AND temp in range |
| MEDIUM | pH out of range OR TDS > 1000 |
| HIGH | pH out of range AND TDS > 1000 AND temp out of range |

### Status Mapping

| Quality Score | Status | LED | Relay |
|---------------|--------|-----|-------|
| >= 80 | NORMAL | Green | ON (valve open) |
| 50 - 79 | WARNING | Yellow | ON |
| < 50 | CRITICAL | Red | OFF (valve closed) |

### Alert Types

| Alert Type | Severity | Trigger |
|------------|----------|---------|
| PH_OUT_OF_RANGE | warning/critical | pH < 6.5 or > 8.5 |
| HIGH_TDS | warning/critical | TDS > 500 ppm |
| CONTAMINATION_RISK | critical | Multiple parameters out of range |
| LOW_WATER_LEVEL | warning | Level < 20% |
| NO_FLOW | warning | Flow rate = 0 |
| HIGH_CHLORINE | warning | Chlorine > 4.0 mg/L |
| LOW_CHLORINE | warning | Chlorine < 0.2 mg/L |
| TURBIDITY_HIGH | warning | Turbidity > 5 NTU |

---

## Module 4: Warehouse Monitoring

### Purpose
Facility management monitoring for storage conditions and security.

### Sensors

| Sensor | Type | Range | Accuracy | Read Interval |
|--------|------|-------|----------|---------------|
| DHT22 | Air Temperature | -40C to 80C | +/- 2C | 1 second |
| DHT22 | Humidity | 0-100% RH | +/- 5% | 1 second |
| HC-SR501 PIR | Motion Detection | 3-7m range | Digital | 1 second |
| HC-SR04 | Distance (Ultrasonic) | 2-400cm | +/- 0.3cm | 1 second |
| MQ-135 | Air Quality | 0-4095 ADC | - | 1 second |

### Thresholds

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| Temperature | < 35C | 35C - 50C | > 50C |
| Humidity | < 70% | 70% - 85% | > 85% |
| Air Quality (ADC) | < 2048 | 2048 - 3072 | > 3072 |
| Storage Utilization | < 80% | 80% - 90% | > 90% |

### Warehouse Score Calculation (0-100)

```
Temperature Score:    100 at 35C, 0 at 50C (linear)
Humidity Score:       100 at 70%, 0 at 100% (linear)
Air Quality Score:    100 at 2048, 0 at 4096 (linear)
Storage Score:        100 < 80% util, 75 at 80-90%, 50 > 90%
Motion Score:         90 if motion detected, 100 if clear

Warehouse Score = TempScore * 0.25 + HumScore * 0.20 + AirScore * 0.25 + StorageScore * 0.15 + MotionScore * 0.15
                  Clamped to 0-100
```

### Storage Utilization

```
Distance Reading → Utilization:
  400cm = 0% (empty)
  0cm   = 100% (full)

Utilization = (MAX_DISTANCE - distance) / (MAX_DISTANCE - MIN_DISTANCE) * 100
```

### Status Mapping

| Score | Status | LED | Relay |
|-------|--------|-----|-------|
| >= 80 | NORMAL | Green | ON (HVAC running) |
| 50 - 79 | WARNING | Yellow | ON |
| < 50 | CRITICAL | Red | OFF |

### Alert Types

| Alert Type | Severity | Trigger |
|------------|----------|---------|
| HIGH_TEMPERATURE | warning/critical | Temp > 35C |
| HIGH_HUMIDITY | warning | Humidity > 70% |
| POOR_AIR_QUALITY | warning/critical | AQ > 2048 |
| STORAGE_FULL | warning | Utilization > 90% |
| UNAUTHORIZED_ACCESS | info | Motion detected outside hours |
| HVAC_FAILURE | critical | Score < 50 |

---

## Cross-Module Features

### Risk Score Standardization

All four modules produce a risk/health/quality score on a 0-100 scale:

| Score Range | Status | Color | Action |
|-------------|--------|-------|--------|
| 0 - 29 | SAFE / NORMAL | Green | Normal operation |
| 30 - 59 | WARNING | Yellow | Monitor closely |
| 60 - 79 | HIGH RISK | Red | Investigate |
| 80 - 100 | CRITICAL | Red + Buzzer | Immediate action |

### Telemetry Interval

All modules send telemetry every **10 seconds** to the backend via REST API.

### Auto-Registration

Devices are automatically registered on first telemetry submission. No manual registration needed.

### Data Retention

- Raw sensor readings: Unlimited (stored in PostgreSQL)
- Aggregated analytics: Daily summaries
- Alerts: Retained until acknowledged and deleted
- Reports: Generated on demand, stored as JSON
