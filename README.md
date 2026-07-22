# Industrial IoT Analytics Suite

> Real-Time Monitoring, Predictive Analytics and Smart Device Management

**Created by NARENDRAMEL**

## Overview

An autonomous platform for testing and integrating IoT devices with a professional analytics dashboard. Supports:

- **Cold Storage Monitoring** - Temperature & humidity tracking
- **Machine Health Monitoring** - Vibration analysis & predictive maintenance
- **Water Quality Monitoring** - pH, turbidity, TDS monitoring
- **Warehouse Monitoring** - Environment conditions & risk assessment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| IoT | ESP32, Wokwi Simulator, Arduino |
| Hosting | Vercel (Frontend), Render (Backend) |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set up PostgreSQL database
# Update .env with your DATABASE_URL
uvicorn app.main:app --reload --port 8000
# Seed demo data: POST http://localhost:8000/api/seed
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Docker
```bash
docker-compose up -d
```

## API Endpoints

### Core
- `GET /api/health` - Health check
- `POST /api/seed` - Seed database with demo data

### Devices
- `GET /api/devices/` - List all devices
- `POST /api/devices/` - Register device
- `GET /api/devices/{id}` - Get device
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device
- `POST /api/devices/{id}/enable` - Enable device
- `POST /api/devices/{id}/disable` - Disable device
- `POST /api/devices/{id}/heartbeat` - Device heartbeat

### Telemetry (ESP32 Integration)
- `POST /api/telemetry/ingest` - **Main ESP32 data ingestion**
- `POST /api/telemetry/batch` - Batch ingestion
- `GET /api/telemetry/latest/{device_id}` - Latest reading
- `GET /api/telemetry/latest` - All latest readings
- `GET /api/telemetry/{device_id}` - Historical data

### Analytics
- `GET /api/analytics/temperature` - Temperature trends
- `GET /api/analytics/machine-health` - Machine health analysis
- `GET /api/analytics/water-quality` - Water quality analysis
- `GET /api/analytics/warehouse` - Warehouse analytics
- `GET /api/analytics/predictive` - Predictive analytics with forecast

### Alerts
- `GET /api/alerts/` - List alerts
- `GET /api/alerts/stats` - Alert statistics
- `POST /api/alerts/` - Create alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

### Reports & Export
- `GET /api/reports/daily` - Daily report
- `GET /api/reports/weekly` - Weekly report
- `GET /api/reports/monthly` - Monthly report
- `GET /api/reports/export/excel` - Excel export
- `GET /api/reports/export/csv` - CSV export

## ESP32 Integration

The firmware in `firmware/esp32_monitor.ino` connects to the API and sends telemetry data every 30 seconds.

### Sensor Support
- DHT22 (Temperature & Humidity)
- MQ-135 (Air Quality / Gas)
- pH Sensor (Water Acidity)
- TDS Sensor (Water Purity)
- Vibration Sensor (Machine Health)

### Data Flow
```
Sensors → ESP32 → REST API → PostgreSQL → Analytics → Dashboard
```

## Dashboard Pages
- Dashboard (Overview with live widgets)
- Device Management (CRUD, enable/disable)
- Analytics (Temperature, Health, Water, Warehouse, Predictive)
- Alerts (Filter, severity levels, resolve)
- Reports (Daily/Weekly/Monthly, Excel/CSV export)
- Settings & Profile

## Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Import repository in Vercel
3. Set build command: `npm run build`, output: `dist`
4. Add environment variable: `VITE_API_URL`

### Render (Backend)
1. Create a new Web Service on Render
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

## License

MIT License - Created by NARENDRAMEL
