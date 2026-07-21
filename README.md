# Industrial IoT Analytics Suite

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-2.0.0-orange)
![Python](https://img.shields.io/badge/python-3.11+-yellow)
![React](https://img.shields.io/badge/react-18.3-61dafb)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-009688)

An enterprise-grade IoT platform for real-time monitoring, predictive analytics, and intelligent alerting across four industrial modules: Cold Storage, Machine Health, Water Quality, and Warehouse management.

## Executive Summary

This platform provides end-to-end IoT monitoring from ESP32 microcontrollers (simulated via Wokwi) through a FastAPI backend to a modern React dashboard. It supports multiple simultaneous monitoring modules, each with specialized sensors, risk calculations, and alert systems. The platform includes predictive analytics powered by scikit-learn, comprehensive reporting, Excel export, and maintenance scheduling.

## Features

### Cold Storage Module
- DHT22 temperature/humidity monitoring
- Door open detection with timer tracking
- Power failure detection
- Gas level monitoring (MQ-136 sensor)
- Compressor current monitoring
- 0-100 risk score calculation
- FDA/HACCP compliance reporting

### Machine Health Module
- Vibration monitoring for bearing wear detection
- Motor temperature tracking
- Current and voltage monitoring
- Health score (0-100) with weighted factors
- Predictive failure analysis (Isolation Forest)
- Automatic safety relay shutdown

### Water Quality Module
- pH level monitoring (0-14)
- Total Dissolved Solids (TDS) tracking
- Turbidity measurement
- Chlorine level monitoring
- Water level and flow rate
- Contamination risk assessment (LOW/MEDIUM/HIGH)

### Warehouse Module
- Temperature and humidity monitoring
- PIR motion detection
- Ultrasonic distance/occupancy tracking
- Air quality monitoring (MQ-135)
- Storage utilization calculation
- HVAC control relay

### Platform Features
- JWT authentication with role-based access (admin/operator/viewer)
- Real-time WebSocket data streaming
- 9 alert rule evaluations per sensor reading
- Predictive analytics with scikit-learn
- Excel export (sensors, alerts, analytics, reports)
- Report generation (daily, weekly, monthly, compliance, maintenance, audit)
- Maintenance scheduling with auto-reminders
- Rate limiting (120 req/min)
- Fully responsive dark dashboard with glassmorphism UI
- 7 chart types (Line, Area, Bar, Radar, Scatter, Heatmap, Timeline)
- Framer Motion animations throughout

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     IoT Analytics Suite                         │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Cold Storage │   Machine    │   Water      │   Warehouse       │
│   Module     │   Health     │   Quality    │   Module          │
├──────────────┴──────────────┴──────────────┴───────────────────┤
│              ESP32 Microcontrollers (Wokwi / Physical)         │
├─────────────────────────────────────────────────────────────────┤
│                   WiFi (REST API / HTTPS)                      │
├─────────────────────────────────────────────────────────────────┤
│              FastAPI Backend (Python 3.11)                      │
│   JWT Auth | Rate Limiting | Alert Engine | Analytics           │
├─────────────────────────────────────────────────────────────────┤
│              PostgreSQL (Neon Cloud)                             │
├─────────────────────────────────────────────────────────────────┤
│              Analytics Engine                                    │
│   Pandas | Scikit-Learn | Predictive Models                    │
├─────────────────────────────────────────────────────────────────┤
│              React Frontend (TypeScript + Vite)                  │
│   Dashboard | Charts | Export | Reports | WebSocket             │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Hardware | ESP32 DevKit V1 + Wokwi Simulator | - |
| Firmware | Arduino C++, ArduinoJson, DHT22 | - |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic | 3.11+, 0.115, 2.0, 2.9 |
| Database | PostgreSQL (Neon Cloud) | 15+ |
| Analytics | Pandas, NumPy, Scikit-Learn | 2.2, 1.26, 1.5 |
| Frontend | React 18, TypeScript, Vite | 18.3, 5.6, 5.4 |
| UI | Tailwind CSS, Framer Motion, Recharts | 3.4, 11.5, 2.13 |
| State | Zustand, React Query (TanStack) | 4.5, 5.56 |
| Auth | JWT (python-jose), bcrypt (passlib) | 3.3, 1.7 |
| Export | OpenPyXL (Excel), StreamingResponse | 3.1 |

## Project Structure

```
iot-analytics-suite/
├── hardware/
│   ├── cold-storage/        # ESP32 firmware, diagram, libraries
│   │   ├── sketch.ino
│   │   ├── diagram.json
│   │   └── libraries.txt
│   ├── machine-health/      # Machine health ESP32 firmware
│   ├── water-quality/       # Water quality ESP32 firmware
│   ├── warehouse/           # Warehouse ESP32 firmware
│   ├── esp32/               # Shared ESP32 code
│   ├── sensors/             # Sensor specifications
│   └── wokwi/               # Legacy Wokwi files
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   └── src/
│       ├── config.py        # Pydantic settings management
│       ├── routes/          # API endpoint definitions
│       │   ├── auth.py      # Register, login, profile, users
│       │   ├── devices.py   # Device CRUD, groups, health
│       │   ├── readings.py  # Sensor readings (all 4 modules)
│       │   ├── alerts.py    # Alert management and rules
│       │   ├── analytics.py # Analytics and predictions
│       │   ├── export.py    # Excel export streaming
│       │   ├── reports.py   # Report generation
│       │   ├── dashboard.py # Dashboard aggregations
│       │   └── maintenance.py # Maintenance scheduling
│       ├── controllers/     # Business logic layer
│       ├── database/        # SQLAlchemy models, async connection
│       ├── middleware/       # JWT auth, rate limiting
│       ├── services/        # Alert evaluation service
│       ├── analytics/       # Analytics engine, predictive models
│       ├── exports/         # Excel export service
│       └── reports/         # Report generator (daily-monthly+)
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Devices, Analytics, Alerts, Reports
│   │   ├── components/      # Layout, Sidebar, StatusBadge, StatCard
│   │   ├── charts/          # 7 Recharts visualization types
│   │   ├── widgets/         # Overview stat widgets
│   │   ├── animations/      # Framer Motion animation variants
│   │   ├── hooks/           # React Query data-fetching hooks
│   │   ├── services/        # Axios API client
│   │   └── store/           # Zustand auth state store
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── analytics/               # Standalone analytics module
│   ├── engine.py            # Core analytics calculations
│   ├── predictor.py         # ML prediction models
│   ├── anomaly.py           # Isolation Forest anomaly detection
│   ├── risk.py              # Risk score computation
│   └── recommendations.py   # AI-generated maintenance recommendations
├── reports/                 # Generated report storage
├── docs/                    # Comprehensive documentation
│   ├── API_DOCUMENTATION.md # Full API reference
│   ├── TESTING.md           # Testing guide
│   ├── WOKWI_SETUP.md       # Wokwi simulator setup
│   ├── MODULE_SPECIFICATIONS.md # Sensor and threshold specs
│   └── ARCHITECTURE.md      # Technical architecture
├── deployment/              # Deployment configs
│   ├── vercel.json          # Vercel frontend config
│   ├── render.yaml          # Render backend blueprint
│   ├── .env.backend.example # Backend environment template
│   ├── .env.frontend.example # Frontend environment template
│   ├── DEPLOYMENT_GUIDE.md  # Step-by-step deployment
│   └── deploy.ps1           # PowerShell deployment script
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database (or Neon account)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit with your DATABASE_URL
uvicorn main:app --reload       # http://localhost:8000
```

API docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
cp ../deployment/.env.frontend.example .env
npm run dev                     # http://localhost:5173
```

### Wokwi Simulation

1. Open https://wokwi.com/projects/new/esp32
2. Copy `hardware/cold-storage/sketch.ino` and `diagram.json`
3. Add libraries: DHT sensor library, Adafruit Unified Sensor, Adafruit GFX Library, Adafruit SSD1306, ArduinoJson
4. Update `API_URL` in sketch.ino with your deployed backend URL
5. Click Start Simulation

## API Overview

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Authentication | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` | JWT auth, user management |
| Devices | `POST /api/device/register`, `GET /api/devices`, `GET /api/device/{id}` | CRUD, enable/disable, health |
| Readings | `POST /api/readings`, `GET /api/readings`, `GET /api/readings/latest` | Telemetry for all 4 modules |
| Alerts | `GET /api/alerts`, `GET /api/alerts/active`, `PUT /api/alerts/{id}/acknowledge` | Alert management and rules |
| Analytics | `GET /api/analytics`, `GET /api/analytics/{id}/predict`, `GET /api/analytics/zones/compare` | Insights and predictions |
| Reports | `POST /api/reports/generate`, `GET /api/reports/{id}/download` | Daily/weekly/monthly/compliance |
| Export | `GET /api/export/excel?type=sensors` | Excel download |
| Dashboard | `GET /api/dashboard/summary`, `GET /api/dashboard/realtime` | Aggregated views |
| Maintenance | `POST /api/maintenance/schedules`, `POST /api/maintenance/{id}/trigger` | Preventive maintenance |
| WebSocket | `ws://backend/ws` | Real-time streaming |

Full API reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Deployment

### Quick Deploy

| Service | Platform | Status |
|---------|----------|--------|
| Backend | Render | [render.yaml](deployment/render.yaml) |
| Frontend | Vercel | [vercel.json](deployment/vercel.json) |
| Database | Neon | PostgreSQL connection string |

### Step-by-Step

1. **Database**: Create Neon project at https://neon.tech, copy connection string
2. **Backend**: Push to GitHub, create Render web service, set environment variables
3. **Frontend**: `cd frontend && vercel --prod`, set VITE_API_URL env var
4. **Wokwi**: Update API_URL in sketch.ino, start simulation

Detailed guide: [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

**Change these immediately in production!**

Set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your backend environment variables.

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API_DOCUMENTATION.md) | Complete API endpoint documentation |
| [Architecture](docs/ARCHITECTURE.md) | System and database architecture |
| [Module Specs](docs/MODULE_SPECIFICATIONS.md) | Sensor thresholds and calculations |
| [Testing Guide](docs/TESTING.md) | Backend, frontend, and integration testing |
| [Wokwi Setup](docs/WOKWI_SETUP.md) | Simulator setup for all 4 modules |
| [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) | Step-by-step deployment |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - Narendravel H

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
