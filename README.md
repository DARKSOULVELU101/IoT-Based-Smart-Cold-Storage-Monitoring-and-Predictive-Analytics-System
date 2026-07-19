# IoT-Based Smart Cold Storage Monitoring and Predictive Analytics System

A production-grade IoT platform for monitoring cold storage environments with real-time dashboards, predictive analytics, alert management, and compliance reporting.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   ESP32      │────▶│  FastAPI      │────▶│  PostgreSQL   │────▶│  React Dashboard  │
│  (Wokwi)    │     │  Backend      │     │  (Neon)       │     │  (Vercel)         │
│             │     │  (Render)     │     │              │     │                   │
│ DHT22       │     │ REST API      │     │ 7 Tables     │     │ Recharts          │
│ Door Switch │     │ JWT Auth      │     │ Indexed      │     │ Framer Motion     │
│ Gas Sensor  │     │ Rate Limiting │     │ UUID PKs     │     │ Tailwind CSS      │
│ Current     │     │ ML Analytics  │     │ JSONB        │     │ Shadcn UI         │
│ OLED + LEDs │     │ Excel Export  │     │              │     │ React Query       │
│ Buzzer      │     │ Alert Engine  │     │              │     │ Zustand           │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────────┘
```

## Features

### Hardware (ESP32 + Wokwi)
- DHT22 temperature/humidity monitoring (2-8°C safe range)
- Door open/close detection with timer
- Power failure detection
- Gas leak detection (MQ sensor)
- Compressor current monitoring
- SSD1306 OLED display
- Status LEDs (Green/Yellow/Red) + Buzzer
- 0-100 spoilage risk score calculation
- WiFi telemetry via REST API (every 10 seconds)

### Backend (FastAPI)
- REST API with JWT authentication
- Role-based access control (admin/operator/viewer)
- Auto-device detection (new ESP32s auto-registered)
- 8-condition alert engine
- Analytics computation (12+ metrics)
- ML predictive analytics (Isolation Forest, Linear Regression)
- Excel export (sensor data, alerts, analytics, reports)
- 6 report types (daily, weekly, monthly, compliance, risk, maintenance)
- Rate limiting and input validation
- Full PostgreSQL database with 7 tables

### Frontend (React + TypeScript)
- Enterprise-grade dark dashboard (Azure IoT / Grafana inspired)
- Real-time data with 5-second auto-refresh
- 8 Recharts visualizations (line, area, bar, heatmap, radar)
- Heavy Framer Motion animations throughout
- Glassmorphism UI with Tailwind CSS
- Responsive design (mobile + desktop)
- 7 pages: Dashboard, Devices, Zones, Analytics, Alerts, Reports, Settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Firmware | Arduino C++, ESP32, Wokwi |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Neon) |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn UI |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand, React Query |
| ML | Scikit-Learn, Pandas |
| Export | OpenPyXL |
| Auth | JWT (python-jose) |

## Project Structure

```
├── hardware/
│   ├── esp32/              # ESP32 firmware files
│   ├── sensors/            # Sensor documentation
│   └── wokwi/              # Wokwi simulation files
│       ├── sketch.ino      # Main firmware
│       ├── diagram.json    # Wokwi circuit diagram
│       └── libraries.txt   # Required libraries
│
├── backend/
│   ├── main.py             # FastAPI application entry
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Container configuration
│   ├── render.yaml         # Render deployment
│   └── src/
│       ├── config.py       # Environment settings
│       ├── database.py     # SQLAlchemy setup
│       ├── models.py       # 7 database models
│       ├── schemas.py      # Pydantic schemas
│       ├── routes/         # API route handlers
│       ├── controllers/    # Business logic
│       ├── middleware/      # Auth, rate limiting
│       ├── services/       # Alert, analytics, report services
│       ├── analytics/      # ML engine + predictive analytics
│       ├── exports/        # Excel export generation
│       ├── alerts/         # Alert evaluation engine
│       └── database/       # SQL schema
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json         # Vercel deployment
│   └── src/
│       ├── pages/          # 8 page components
│       ├── components/     # 11 reusable components
│       ├── widgets/        # 4 dashboard widgets
│       ├── charts/         # 9 chart components
│       ├── animations/     # 4 animation wrappers
│       ├── hooks/          # 6 React Query hooks
│       ├── services/       # API client
│       ├── store/          # Zustand auth store
│       └── lib/            # Utility functions
│
├── docs/                   # Documentation
│   ├── api.md              # Full API documentation
│   └── deployment.md       # Deployment guide
│
└── deployment/             # Deployment configs
    ├── render.yaml
    ├── vercel.json
    ├── neon-setup.sql      # Database schema DDL
    └── env.example         # Environment variables
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Neon account)

### 1. Database Setup

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -d coldstorage -f deployment/neon-setup.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Wokwi Simulation

1. Open [wokwi.com](https://wokwi.com/projects/new/esp32)
2. Replace `sketch.ino` with `hardware/wokwi/sketch.ino`
3. Replace `diagram.json` with `hardware/wokwi/diagram.json`
4. Add libraries from `hardware/wokwi/libraries.txt`
5. Update `API_URL` in `sketch.ino` to your backend URL
6. Run simulation

### Default Login

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/readings` | No | Ingest ESP32 telemetry |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/health` | No | Health check |
| GET | `/api/devices` | Yes | List devices |
| POST | `/api/device/register` | Yes | Register device |
| PUT | `/api/devices/{id}` | Yes | Update device |
| DELETE | `/api/devices/{id}` | Yes | Delete device |
| GET | `/api/readings` | Yes | Query readings |
| GET | `/api/readings/latest` | Yes | Latest per device |
| GET | `/api/analytics/summary` | Yes | Dashboard summary |
| GET | `/api/analytics/zones` | Yes | Zone comparison |
| GET | `/api/analytics/predictions/{id}` | Yes | ML predictions |
| GET | `/api/alerts` | Yes | List alerts |
| GET | `/api/alerts/active` | Yes | Active alerts |
| POST | `/api/alerts/{id}/resolve` | Yes | Resolve alert |
| GET | `/api/alerts/stats` | Yes | Alert statistics |
| POST | `/api/reports/generate` | Yes | Generate report |
| GET | `/api/export/excel` | Yes | Export to Excel |

Full API documentation: [docs/api.md](docs/api.md)

## Database Schema

7 tables with UUID primary keys, proper indexes, and JSONB support:

- **devices** - Registered IoT devices
- **sensor_readings** - Time-series sensor data
- **alerts** - Alert events with levels
- **analytics** - Computed analytics periods
- **reports** - Generated reports
- **users** - User accounts with roles
- **audit_logs** - Action audit trail

Schema: [deployment/neon-setup.sql](deployment/neon-setup.sql)

## Alert Conditions

| Alert | Level | Trigger |
|-------|-------|---------|
| Temperature High | Warning/Critical | > 8°C |
| Temperature Low | Warning | < 2°C |
| Humidity Deviation | Warning | > 70% |
| Door Left Open | Warning/Critical | > 15 seconds |
| Gas Leak | Critical | > 2600 ADC |
| Power Failure | Critical | powerAvailable = false |
| Compressor Failure | Warning | Current > 8A |
| High Risk Score | Critical | Risk score > 60 |

## Risk Score Formula

```
riskScore = clamp(
  temperatureRisk +    // 0-40 (deviation from 2-8°C)
  humidityRisk +       // 0-20 (excess over 70%)
  doorRisk +           // 0-15 (seconds open, capped)
  powerRisk +          // 0 or 15
  gasRisk +            // 0 or 10
  currentRisk,         // 0 or 10
  0, 100
)
```

Status: SAFE (<30) | WARNING (30-59) | HIGH RISK (60-79) | CRITICAL (80-100)

## Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | Vercel | React dashboard |
| Backend | Render | FastAPI server |
| Database | Neon | PostgreSQL |

Detailed guide: [docs/deployment.md](docs/deployment.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Author

**Narendravel H** - IoT Developer
