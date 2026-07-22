<div align="center">

<img src="https://img.shields.io/badge/Status-Production%20Ready-00C853?style=for-the-badge" alt="status" />
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="version" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="license" />

# Industrial IoT Analytics Suite

### Real-Time Monitoring | Predictive Analytics | Smart Device Management

**An enterprise-grade IoT platform for monitoring cold storage, machine health, water quality, and warehouse environments — powered by ESP32 sensors, FastAPI, and a real-time analytics dashboard.**

<br/>

[![Deployed Frontend](https://img.shields.io/badge/Frontend-Vercel-FF6B35?style=for-the-badge&logo=vercel&logoColor=white)](https://iot-analytics-suite.vercel.app)
[![Deployed Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://iot-backend-api.onrender.com)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-00C853?style=for-the-badge&logo=react&logoColor=white)](https://iot-analytics-suite.vercel.app)

<br/>

<img width="900" src="https://github-readme-stats.vercel.app/api?username=DARKSOULVELU101&show_icons=true&theme=radical&hide_border=true&count_private=true" />

<br/>

---

</div>

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ESP32 +    │────▶│   FastAPI    │────▶│  PostgreSQL  │────▶│   React      │
│   Sensors    │     │   Backend    │     │  Database    │     │  Dashboard   │
│              │     │  (Render)    │     │  (Render)    │     │  (Vercel)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     Sensors            REST API            Data Store          Visualization
     Telemetry          Analytics            Storage             Charts/Graphs
     Heartbeat          Alerts               Queries             Real-time UI
```

```
Sensors  →  ESP32  →  REST API  →  PostgreSQL  →  Analytics Engine  →  Dashboard
 DHT22       WiFi       Ingest         Store          ML/Predict         React UI
 MQ-135                  Parse         Query          Trend Analysis     Recharts
 pH / TDS               Validate      Aggregate      Risk Scoring       Framer Motion
 Vibration               Alerts                         Forecasting       Tailwind
```

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Real-Time Dashboard
- Live telemetry updates with 10-second refresh
- Device health score cards with animated indicators
- Interactive temperature, humidity & risk gauges
- Alert count badges with severity color-coding

### Analytics Engine
- **Temperature Analytics** - Trend lines, anomaly detection, forecasts
- **Machine Health** - Vibration analysis, predictive maintenance scores
- **Water Quality** - pH, turbidity, TDS monitoring with pass/fail
- **Warehouse** - Environment conditions & risk assessment
- **Predictive Analytics** - 7-day forecast with confidence intervals

</td>
<td width="50%" valign="top">

### Device Management
- Full CRUD operations for IoT devices
- Enable/disable devices remotely
- Heartbeat monitoring & status tracking
- Device type categorization (Cold Storage, Machine Water, Warehouse)

### Alerting System
- Multi-severity alerts (Low, Medium, High, Critical)
- Automatic threshold-based alert generation
- One-click alert resolution
- Alert statistics & history tracking

### Reports & Export
- Daily, Weekly, Monthly aggregated reports
- Excel & CSV export with full telemetry data
- Historical trend analysis
- Device performance comparisons

</td>
</tr>
</table>

---

## Tech Stack

<div align="center">

| Category | Technology | Purpose |
|:---:|:---:|:---|
| **Frontend** | <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" /> | UI Framework |
| | <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" /> | Build Tool |
| | <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" /> | Styling |
| | <img src="https://img.shields.io/badge/Framer_Motion-A855F7?style=flat-square&logo=framer&logoColor=white" /> | Animations |
| | <img src="https://img.shields.io/badge/Recharts-FF6384?style=flat-square" /> | Charts |
| | <img src="https://img.shields.io/badge/React_Query-FF4E50?style=flat-square" /> | Data Fetching |
| **Backend** | <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" /> | API Framework |
| | <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square" /> | ORM |
| | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> | Database |
| | <img src="https://img.shields.io/badge/Pydantic-E92063?style=flat-square" /> | Data Validation |
| **IoT** | <img src="https://img.shields.io/badge/ESP32-E80D0D?style=flat-square&logo=espressif&logoColor=white" /> | Microcontroller |
| | <img src="https://img.shields.io/badge/Wokwi-FF6B35?style=flat-square" /> | Simulator |
| | <img src="https://img.shields.io/badge/Arduino-00979D?style=flat-square&logo=arduino&logoColor=white" /> | Firmware |
| **DevOps** | <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" /> | Containerization |
| | <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" /> | CI/CD |

</div>

---

## Project Structure

```
IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── models.py               # Database models (5 tables)
│   │   ├── schemas.py              # Pydantic validation schemas
│   │   ├── routers/
│   │   │   ├── devices.py          # Device CRUD & management
│   │   │   ├── telemetry.py        # Telemetry ingestion & queries
│   │   │   ├── analytics.py        # Analytics engine (5 modules)
│   │   │   ├── alerts.py           # Alert management & stats
│   │   │   ├── reports.py          # Reports & data export
│   │   │   ├── dashboard.py        # Dashboard summary endpoint
│   │   │   └── auth.py             # Authentication
│   │   └── services/
│   │       ├── analytics_engine.py # Predictive analytics engine
│   │       └── seed_data.py        # Demo data seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/            # Apple-style landing page
│   │   │   ├── layout/             # Sidebar, header, navigation
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── pages/                  # 10+ page components
│   │   ├── lib/
│   │   │   ├── api.js              # Axios API client
│   │   │   └── hooks.js            # React Query hooks
│   │   └── App.jsx                 # Route configuration
│   ├── vercel.json
│   └── package.json
├── firmware/
│   ├── esp32_monitor.ino           # ESP32 sensor firmware
│   └── wokwi-diagram.json          # Wokwi simulation config
├── docker-compose.yml
└── README.md
```

---

## API Reference

<details>
<summary><strong>Core Endpoints</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/seed` | Seed database with demo data |

</details>

<details>
<summary><strong>Devices</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/devices/` | List all devices (filterable) |
| `GET` | `/api/devices/count` | Device count by type & status |
| `POST` | `/api/devices/` | Register new device |
| `GET` | `/api/devices/{id}` | Get device details |
| `PUT` | `/api/devices/{id}` | Update device |
| `DELETE` | `/api/devices/{id}` | Remove device |
| `POST` | `/api/devices/{id}/enable` | Enable device |
| `POST` | `/api/devices/{id}/disable` | Disable device |
| `POST` | `/api/devices/{id}/heartbeat` | Record heartbeat |

</details>

<details>
<summary><strong>Telemetry (ESP32 Integration)</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `POST` | `/api/telemetry/ingest` | Ingest sensor data from ESP32 |
| `POST` | `/api/telemetry/batch` | Batch data ingestion |
| `GET` | `/api/telemetry/latest/{device_id}` | Latest reading for device |
| `GET` | `/api/telemetry/latest` | All latest readings |
| `GET` | `/api/telemetry/{device_id}` | Historical telemetry data |

</details>

<details>
<summary><strong>Analytics</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/analytics/temperature` | Temperature trends & anomalies |
| `GET` | `/api/analytics/machine-health` | Vibration & health analysis |
| `GET` | `/api/analytics/water-quality` | pH, turbidity, TDS analytics |
| `GET` | `/api/analytics/warehouse` | Warehouse environment analytics |
| `GET` | `/api/analytics/predictive` | 7-day predictive forecast |

</details>

<details>
<summary><strong>Alerts</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/alerts/` | List alerts (filterable) |
| `GET` | `/api/alerts/stats` | Alert statistics |
| `POST` | `/api/alerts/` | Create alert |
| `PUT` | `/api/alerts/{id}/resolve` | Resolve alert |
| `POST` | `/api/alerts/resolve-all` | Resolve all alerts |

</details>

<details>
<summary><strong>Reports & Export</strong></summary>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/reports/daily` | Daily report |
| `GET` | `/api/reports/weekly` | Weekly report |
| `GET` | `/api/reports/monthly` | Monthly report |
| `GET` | `/api/reports/export/excel` | Download as Excel |
| `GET` | `/api/reports/export/csv` | Download as CSV |

</details>

---

## ESP32 Firmware

The firmware in `firmware/esp32_monitor.ino` connects to the API and transmits telemetry every 30 seconds.

### Supported Sensors

| Sensor | Measurement | Pin |
|:---:|:---|:---:|
| DHT22 | Temperature & Humidity | GPIO4 |
| MQ-135 | Air Quality (CO2, NH3) | GPIO34 |
| pH Sensor | Water Acidity (0-14) | GPIO35 |
| TDS Sensor | Total Dissolved Solids | GPIO32 |
| Vibration | Machine Health (g) | GPIO33 |

### Data Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────┐    ┌───────────┐
│ Sensors  │───▶│  ESP32  │───▶│ REST API│───▶│ PostgreSQL  │───▶│ Dashboard │
│ (Analog) │    │ (WiFi)  │    │ (FastAPI)│    │ (Storage)   │    │ (React)   │
└─────────┘    └─────────┘    └─────────┘    └─────────────┘    └───────────┘
   5 sensors     JSON POST      Ingest &        Persistent         Real-time
   per device    every 30s      Validate        Storage            Visualization
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- (Optional) Docker & Docker Compose

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System.git
cd IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure database
export DATABASE_URL="postgresql://user:pass@localhost:5432/iot_monitoring"

# Start server & seed data
uvicorn app.main:app --reload --port 8000
curl -X POST http://localhost:8000/api/seed
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

**4. Docker (All-in-One)**
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000/api/docs
```

---

## Dashboard Screenshots

> The dashboard features a responsive, dark-themed UI with real-time data visualization.

- **Landing Page** - Cinematic Apple-style landing with particle effects
- **Dashboard** - Overview cards, live charts, recent alerts
- **Device Management** - Table view with CRUD operations & status indicators
- **Temperature Analytics** - Trend lines, min/max/avg, anomaly highlighting
- **Machine Health** - Vibration analysis, health scores, maintenance alerts
- **Water Quality** - pH, turbidity, TDS with pass/fail thresholds
- **Predictive Analytics** - 7-day forecast with confidence bands
- **Alerts** - Filterable alert table with severity badges
- **Reports** - Daily/Weekly/Monthly summaries with Excel/CSV export

---

## Deployment

### Vercel (Frontend)

| Setting | Value |
|:---|:---|
| Build Command | `npm install && npm run build` |
| Output Directory | `dist` |
| Framework | Vite |
| Env Variable | `VITE_API_URL = https://iot-backend-api.onrender.com` |

### Render (Backend + Database)

| Setting | Value |
|:---|:---|
| Runtime | Python 3.12 |
| Build Command | `pip install --upgrade pip setuptools wheel && pip install -r backend/requirements.txt` |
| Start Command | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Env Variable | `DATABASE_URL = postgresql://...` (Internal DB URL) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

**NARENDRAMEL**

<a href="https://github.com/DARKSOULVELU101">
<img src="https://img.shields.io/badge/GitHub-DARKSOULVELU101-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>

---

<div align="center">

**Built with passion for Industrial IoT**

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/ESP32-E80D0D?style=for-the-badge&logo=espressif&logoColor=white" />

<br/>

[![Star History Chart](https://api.star-history.com/svg?repos=DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System&type=Date)](https://star-history.com/#DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System&Date)

</div>
