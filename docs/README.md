# Industrial IoT Analytics Suite

An enterprise-grade IoT platform for real-time monitoring, predictive analytics, and intelligent alerting across four industrial modules: Cold Storage, Machine Health, Water Quality, and Warehouse management.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     IoT Analytics Suite                         │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Cold Storage │   Machine    │   Water      │   Warehouse       │
│   Module     │   Health     │   Quality    │   Module          │
│              │   Module     │   Module     │                   │
├──────────────┴──────────────┴──────────────┴───────────────────┤
│              ESP32 Microcontrollers (Wokwi / Physical)         │
│   Sensors: DHT22, PIR, Ultrasonic, Gas, Current, pH, TDS      │
├─────────────────────────────────────────────────────────────────┤
│                   WiFi (REST API / HTTPS)                      │
├─────────────────────────────────────────────────────────────────┤
│              FastAPI Backend (Python 3.11)                      │
│   JWT Auth | Rate Limiting | Alert Engine | Analytics           │
├─────────────────────────────────────────────────────────────────┤
│              PostgreSQL (Neon Cloud)                             │
│   Devices | Readings | Alerts | Analytics | Reports | Users    │
├─────────────────────────────────────────────────────────────────┤
│              Analytics Engine                                    │
│   Pandas | Scikit-Learn | Predictive Models                    │
├─────────────────────────────────────────────────────────────────┤
│              React Frontend (TypeScript + Vite)                  │
│   Dashboard | Charts | Export | Reports | WebSocket             │
└─────────────────────────────────────────────────────────────────┘
```

## Modules

| Module | Sensors | Primary Metric | Use Case |
|--------|---------|---------------|----------|
| **Cold Storage** | DHT22, Gas, Current, Door, Power | Risk Score (0-100) | Refrigerated storage monitoring |
| **Machine Health** | DHT22, Vibration, Current, Voltage | Health Score (0-100) | Predictive maintenance |
| **Water Quality** | pH, TDS, Turbidity, Flow, Level | Quality Score (0-100) | Water treatment monitoring |
| **Warehouse** | DHT22, PIR, Ultrasonic, Air Quality | Warehouse Score (0-100) | Facility management |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Hardware | ESP32 DevKit V1 + Wokwi Simulator | - |
| Firmware | Arduino C++, ArduinoJson | - |
| Backend | Python, FastAPI, SQLAlchemy | 3.11+, 0.115, 2.0 |
| Database | PostgreSQL (Neon Cloud) | 15+ |
| Analytics | Pandas, Scikit-Learn | 2.2, 1.5 |
| Frontend | React 18, TypeScript, Vite | 18.3, 5.6, 5.4 |
| UI | Tailwind CSS, Framer Motion, Recharts | 3.4, 11.5, 2.13 |
| Auth | JWT (python-jose, passlib) | 3.3, 1.7 |
| Export | OpenPyXL (Excel) | 3.1 |

## Project Structure

```
iot-analytics-suite/
├── hardware/
│   ├── cold-storage/        # Cold Storage ESP32 firmware
│   │   ├── sketch.ino
│   │   ├── diagram.json
│   │   └── libraries.txt
│   ├── machine-health/      # Machine Health ESP32 firmware
│   ├── water-quality/       # Water Quality ESP32 firmware
│   ├── warehouse/           # Warehouse ESP32 firmware
│   ├── esp32/               # Shared ESP32 code
│   ├── sensors/             # Sensor specifications
│   └── wokwi/               # Legacy Wokwi files
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment template
│   └── src/
│       ├── config.py        # Settings management
│       ├── routes/          # API endpoint definitions
│       │   ├── auth.py      # Authentication (register, login, users)
│       │   ├── devices.py   # Device CRUD, groups, health
│       │   ├── readings.py  # Sensor readings (all 4 modules)
│       │   ├── alerts.py    # Alert management and rules
│       │   ├── analytics.py # Analytics and predictions
│       │   ├── export.py    # Excel export
│       │   ├── reports.py   # Report generation
│       │   ├── dashboard.py # Dashboard aggregations
│       │   └── maintenance.py # Maintenance scheduling
│       ├── controllers/     # Business logic layer
│       ├── database/        # SQLAlchemy models and connection
│       ├── middleware/       # JWT auth, rate limiting
│       ├── services/        # Alert evaluation service
│       ├── analytics/       # Analytics engine, predictive models
│       ├── exports/         # Excel export service
│       └── reports/         # Report generator
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, Devices, Analytics, Alerts, Reports
│   │   ├── components/      # Layout, Cards, StatusBadge, Sidebar
│   │   ├── charts/          # Recharts visualizations (7 chart types)
│   │   ├── widgets/         # Overview stat widgets
│   │   ├── animations/      # Framer Motion variants
│   │   ├── hooks/           # React Query data hooks
│   │   ├── services/        # Axios API client
│   │   └── store/           # Zustand auth store
│   ├── package.json
│   └── vercel.json
├── analytics/               # Standalone analytics module
│   ├── engine.py            # Core analytics calculations
│   ├── predictor.py         # ML prediction models
│   ├── anomaly.py           # Anomaly detection (Isolation Forest)
│   ├── risk.py              # Risk score computation
│   └── recommendations.py   # AI-generated recommendations
├── reports/                 # Generated report storage
├── docs/                    # Documentation
├── deployment/              # Deployment configs and scripts
└── README.md
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit with your DATABASE_URL
uvicorn main:app --reload       # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp ../deployment/.env.frontend.example .env
npm run dev                     # http://localhost:5173
```

### Wokwi Simulation

1. Open https://wokwi.com/projects/new/esp32
2. Copy `hardware/cold-storage/sketch.ino` and `diagram.json`
3. Add libraries from `hardware/cold-storage/libraries.txt`
4. Set `API_URL` to your deployed backend URL
5. Start simulation

## API Overview

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Authentication | `/api/auth/*` | Register, login, profile, user management |
| Devices | `/api/device/*`, `/api/devices` | CRUD, groups, enable/disable, health |
| Readings | `/api/readings/*` | Submit and query sensor data (all modules) |
| Alerts | `/api/alerts/*` | List, acknowledge, delete, rules |
| Analytics | `/api/analytics/*` | Summaries, trends, predictions, comparisons |
| Reports | `/api/reports/*` | Generate and download reports |
| Export | `/api/export/*` | Excel export (sensors, alerts, analytics) |
| Dashboard | `/api/dashboard/*` | Summary, realtime, charts |
| Maintenance | `/api/maintenance/*` | Schedule and trigger maintenance |
| WebSocket | `/ws` | Real-time data streaming |

Full API documentation: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Deployment

| Service | Platform | URL Pattern |
|---------|----------|-------------|
| Backend | Render | `https://iot-analytics-suite-api.onrender.com` |
| Frontend | Vercel | `https://iot-analytics-suite.vercel.app` |
| Database | Neon | PostgreSQL connection string |

Deployment guide: [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

**Change these immediately in production!**

## License

MIT License - Narendravel H
