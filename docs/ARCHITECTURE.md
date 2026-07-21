# Technical Architecture - IoT Analytics Suite

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Cold Store  │  │  Machine    │  │  Water      │  │  Warehouse   │  │
│  │  ESP32       │  │  Health     │  │  Quality    │  │  ESP32       │  │
│  │  (Wokwi)     │  │  ESP32      │  │  ESP32      │  │  (Wokwi)     │  │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│         │                 │                 │                 │          │
│         └─────────────────┴────────┬────────┴─────────────────┘          │
│                                    │ WiFi / HTTPS                       │
│  ┌─────────────────────────────────┼───────────────────────────────────┐ │
│  │  React Dashboard (Vercel)       │                                  │ │
│  │  TypeScript + Tailwind + Recharts│                                  │ │
│  └─────────────────────────────────┼───────────────────────────────────┘ │
├────────────────────────────────────┼─────────────────────────────────────┤
│                           APPLICATION LAYER                              │
│                                    │                                     │
│  ┌─────────────────────────────────┼───────────────────────────────────┐ │
│  │  FastAPI Backend (Render)       │                                  │ │
│  │                                 ▼                                  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │ │
│  │  │ Auth     │ │ Devices  │ │ Readings │ │ Alerts   │              │ │
│  │  │ Router   │ │ Router   │ │ Router   │ │ Router   │              │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │ │
│  │       │            │            │            │                     │ │
│  │  ┌────┴────┐ ┌─────┴────┐ ┌────┴─────┐ ┌───┴──────┐              │ │
│  │  │Analytics│ │ Reports  │ │ Export   │ │Dashboard │              │ │
│  │  │ Router  │ │ Router   │ │ Router   │ │ Router   │              │ │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └───┬──────┘              │ │
│  │       │           │            │            │                     │ │
│  │  ┌────┴───────────┴────────────┴────────────┴──────┐              │ │
│  │  │           Middleware Layer                        │              │ │
│  │  │  JWT Auth | Rate Limiting | CORS                │              │ │
│  │  └────────────────────┬────────────────────────────┘              │ │
│  └───────────────────────┼───────────────────────────────────────────┘ │
├──────────────────────────┼─────────────────────────────────────────────┤
│                       DATA LAYER                                        │
│                          │                                              │
│  ┌───────────────────────┼───────────────────────────────────────────┐ │
│  │  Service Layer         │                                          │ │
│  │  ┌────────────┐ ┌─────┴──────┐ ┌────────────┐ ┌──────────────┐  │ │
│  │  │ Alert      │ │ Analytics  │ │ Predictive │ │ Report       │  │ │
│  │  │ Service    │ │ Engine     │ │ Engine     │ │ Generator    │  │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │ │
│  └───────────────────────┬───────────────────────────────────────────┘ │
│                          │                                              │
│  ┌───────────────────────┼───────────────────────────────────────────┐ │
│  │  PostgreSQL (Neon Cloud)                                          │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │ │
│  │  │devices │ │readings│ │alerts  │ │analytics│ │reports │         │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                    │ │
│  │  │users   │ │alert_  │ │audit_  │ │device_ │                    │ │
│  │  │        │ │rules   │ │logs    │ │groups  │                    │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users      │     │     devices      │     │  alert_rules  │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (UUID PK) │     │ id (UUID PK)     │     │ id (UUID PK) │
│ username      │     │ device_id (UK)   │     │ name          │
│ email (UK)    │     │ zone             │     │ module_type   │
│ hashed_pwd    │     │ name             │     │ alert_type    │
│ role          │     │ module_type      │     │ severity      │
│ is_active     │     │ group_name       │     │ threshold_*   │
│ created_at    │     │ status           │     │ enabled       │
└──────────────┘     │ firmware_version │     └──────────────┘
                      │ ip_address       │
                      │ mac_address      │
                      │ last_heartbeat   │
                      │ metadata_json    │
                      │ created_at       │
                      │ updated_at       │
                      └────────┬─────────┘
                               │
              ┌────────────────┼─────────────────────┐
              │                │                      │
              ▼                ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  sensor_readings │ │     alerts       │ │    analytics     │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ id (UUID PK)     │ │ id (UUID PK)     │ │ id (UUID PK)     │
│ device_id (FK)   │ │ device_id (FK)   │ │ device_id (FK)   │
│ module_type      │ │ module_type      │ │ module_type      │
│ temperature      │ │ alert_type       │ │ date             │
│ humidity         │ │ severity         │ │ avg_temp/min/max │
│ door_open        │ │ message          │ │ avg_humidity     │
│ gas_level        │ │ acknowledged     │ │ avg_risk_score   │
│ compressor_*     │ │ created_at       │ │ avg_vibration    │
│ vibration        │ │ acknowledged_at  │ │ avg_current      │
│ current/voltage  │ └──────────────────┘ │ avg_ph/tds       │
│ ph/tds/turbidity │                      │ avg_air_quality  │
│ air_quality      │                      │ avg_occupancy    │
│ occupancy        │                      └──────────────────┘
│ risk_score       │
│ status           │     ┌──────────────────┐
│ created_at       │     │     reports      │
└──────────────────┘     ├──────────────────┤
                          │ id (UUID PK)     │
┌──────────────────┐     │ device_id (FK)   │
│  maintenance_    │     │ module_type      │
│  schedules       │     │ report_type      │
├──────────────────┤     │ report_data (JSON)│
│ id (UUID PK)     │     │ file_path        │
│ device_id (FK)   │     │ created_at       │
│ task_name        │     └──────────────────┘
│ task_type        │
│ interval_days    │     ┌──────────────────┐
│ last_performed   │     │   audit_logs     │
│ next_due         │     ├──────────────────┤
│ status           │     │ id (UUID PK)     │
│ notes            │     │ user_id          │
│ created_at       │     │ action           │
│ updated_at       │     │ resource         │
└──────────────────┘     │ details (JSON)   │
                          │ ip_address       │
┌──────────────────┐     │ created_at       │
│  device_groups   │     └──────────────────┘
├──────────────────┤
│ id (UUID PK)     │
│ name (UK)        │
│ description      │
│ module_type      │
│ created_at       │
│ updated_at       │
└──────────────────┘
```

### Table Descriptions

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `devices` | Registered IoT devices | device_id, zone, module_type, status |
| `sensor_readings` | All telemetry data | device_id, temperature, humidity, risk_score, 20+ sensor fields |
| `alerts` | Generated alerts | device_id, alert_type, severity, acknowledged |
| `alert_rules` | Custom alert thresholds | threshold_field, threshold_operator, threshold_value |
| `analytics` | Aggregated daily stats | device_id, date, avg values for all sensors |
| `reports` | Generated reports | device_id, report_type, report_data (JSON) |
| `users` | System users | username, email, role, hashed_password |
| `audit_logs` | Action audit trail | user_id, action, resource, details |
| `device_groups` | Device grouping | name, module_type |
| `maintenance_schedules` | Maintenance tracking | device_id, task_name, interval_days, next_due |

## API Design

### REST Conventions

| Method | Purpose | Example |
|--------|---------|---------|
| `POST` | Create resource | `POST /api/readings` |
| `GET` | Read resource | `GET /api/devices` |
| `PUT` | Update resource | `PUT /api/device/{id}` |
| `DELETE` | Delete resource | `DELETE /api/alert/{id}` |

### URL Structure

```
/api/
├── auth/
│   ├── register          POST
│   ├── login             POST
│   ├── me                GET, PUT
│   ├── users             GET (admin)
│   └── users/{id}/role   PUT (admin)
├── device/
│   ├── register          POST
│   ├── {id}              GET, PUT, DELETE
│   ├── {id}/enable       POST
│   ├── {id}/disable      POST
│   ├── {id}/health       GET
│   ├── discover          POST
│   └── groups            GET, POST
├── devices               GET (list all)
├── readings
│   ├── (generic)         POST, GET
│   ├── /cold-storage     POST
│   ├── /machine-health   POST
│   ├── /water-quality    POST
│   ├── /warehouse        POST
│   ├── /latest           GET
│   ├── /{device_id}      GET
│   └── /stats/summary    GET
├── alerts
│   ├── (list)            GET
│   ├── /active           GET
│   ├── /rules            GET, POST
│   └── /{id}/acknowledge PUT
├── analytics
│   ├── (summary)         GET
│   ├── /{device_id}      GET
│   ├── /{id}/trend       GET
│   ├── /{id}/predict     GET
│   ├── /zones/compare    GET
│   ├── /modules/compare  GET
│   └── /dashboard        GET
├── reports
│   ├── (list)            GET
│   ├── /generate         POST
│   ├── /{id}             GET
│   └── /{id}/download    GET
├── export
│   └── /excel            GET
├── dashboard
│   ├── /summary          GET
│   ├── /realtime         GET
│   ├── /alerts           GET
│   └── /charts           GET
├── maintenance
│   ├── /schedules        GET, POST
│   ├── /schedules/{id}   PUT
│   └── /{device_id}/trigger POST
└── health                GET
```

### Authentication Flow

```
Client                    Server
  │                         │
  │  POST /api/auth/login   │
  │  {username, password}   │
  │ ──────────────────────> │
  │                         │── Verify password (bcrypt)
  │                         │── Generate JWT token
  │  {access_token, user}   │
  │ <────────────────────── │
  │                         │
  │  GET /api/devices       │
  │  Authorization: Bearer  │
  │ ──────────────────────> │
  │                         │── Decode JWT
  │                         │── Check role permissions
  │                         │── Query database
  │  {devices: [...]}       │
  │ <────────────────────── │
```

### Rate Limiting

- **Limit**: 120 requests per minute per client
- **Implementation**: In-memory sliding window
- **Headers**: `Retry-After` on 429 response
- **Scope**: Per IP address

## Frontend Architecture

### Component Structure

```
src/
├── App.tsx                    # Router setup
├── main.tsx                   # Entry point
├── pages/
│   ├── Dashboard.tsx          # Main dashboard with overview
│   ├── Devices.tsx            # Device management
│   ├── Analytics.tsx          # Analytics and comparisons
│   ├── Alerts.tsx             # Alert management
│   ├── Reports.tsx            # Report generation
│   └── Export.tsx             # Excel export
├── components/
│   ├── Layout.tsx             # App shell with sidebar
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── StatusBadge.tsx        # Status indicator component
│   └── StatCard.tsx           # Dashboard stat card
├── charts/
│   ├── LineChart.tsx          # Time series line chart
│   ├── AreaChart.tsx          # Area chart for trends
│   ├── BarChart.tsx           # Bar chart for comparisons
│   ├── RadarChart.tsx         # Radar chart for multi-metric
│   ├── ScatterChart.tsx       # Scatter plot for correlations
│   ├── HeatmapChart.tsx       # Heatmap for time-based data
│   └── TimelineChart.tsx      # Timeline for events
├── widgets/
│   ├── OverviewWidgets.tsx    # Dashboard overview widgets
│   └── ModuleWidgets.tsx      # Per-module stat widgets
├── animations/
│   └── variants.ts            # Framer Motion animation variants
├── hooks/
│   └── useApi.ts              # React Query hooks for all endpoints
├── services/
│   └── api.ts                 # Axios instance and API functions
└── store/
    └── auth.ts                # Zustand auth state management
```

### State Management

```
┌─────────────────────────────────────────────┐
│              Zustand Store                   │
│                                             │
│  authStore:                                 │
│  ├── token: string | null                   │
│  ├── user: User | null                      │
│  ├── isAuthenticated: boolean               │
│  ├── login(username, password)              │
│  ├── logout()                               │
│  └── setUser(user)                          │
│                                             │
│  React Query Cache:                         │
│  ├── useDevices()      → GET /api/devices   │
│  ├── useReadings()     → GET /api/readings  │
│  ├── useAlerts()       → GET /api/alerts    │
│  ├── useAnalytics()    → GET /api/analytics │
│  ├── useDashboard()    → GET /api/dashboard │
│  └── useReports()      → GET /api/reports   │
└─────────────────────────────────────────────┘
```

### Data Flow

```
ESP32 Device
    │
    │ POST /api/readings (every 10s)
    ▼
FastAPI Backend
    │
    ├── Auto-register device
    ├── Store sensor reading
    ├── Evaluate alert rules (9 per reading)
    │   ├── Temperature threshold
    │   ├── Humidity threshold
    │   ├── Door open duration
    │   ├── Power failure
    │   ├── Gas level
    │   ├── Current level
    │   ├── Vibration level
    │   ├── pH level
    │   └── Air quality
    ├── Create alerts if triggered
    └── Broadcast via WebSocket
    
    ▼

React Dashboard (polling every 10-30s)
    │
    ├── Dashboard summary → Stats cards, charts
    ├── Realtime data → Device cards, gauges
    ├── Alerts → Alert list, badges
    ├── Analytics → Trend charts, comparisons
    └── Reports → Generate, download
```

## Security Model

### Authentication

- **JWT (JSON Web Tokens)** with HS256 algorithm
- **Token expiration**: 24 hours (configurable)
- **Password hashing**: bcrypt via passlib
- **Token storage**: Client-side (localStorage/sessionStorage)

### Authorization

| Role | Read | Write | Admin |
|------|------|-------|-------|
| `admin` | All | All | Yes |
| `operator` | All | Devices, Readings, Alerts, Reports | No |
| `viewer` | All | No | No |

### CORS Configuration

```
Allowed Origins: Configured via CORS_ORIGINS env var
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
Credentials: true
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting

- 120 requests per minute per IP
- Applied globally to all endpoints
- Returns 429 status with Retry-After header

## Scalability Considerations

### Current Architecture (Free Tier)

| Component | Service | Limitation |
|-----------|---------|------------|
| Backend | Render Free | 15 min cold start, 750 hrs/month |
| Database | Neon Free | 0.5 GB storage, auto-pause after inactivity |
| Frontend | Vercel Free | 100 GB bandwidth/month |
| Simulation | Wokwi Free | Limited concurrent projects |

### Scaling Strategy

**Phase 1: Growth (Paid Tiers)**
- Render Starter ($7/mo): No cold starts, always-on
- Neon Pro ($19/mo): No auto-pause, more storage
- Vercel Pro ($20/mo): More bandwidth, analytics

**Phase 2: Performance**
- Add Redis for session caching and rate limiting
- Implement WebSocket for real-time push (instead of polling)
- Add background task queue (Celery + Redis) for analytics
- Database read replicas for query performance

**Phase 3: Enterprise**
- Kubernetes deployment (EKS/GKE)
- PostgreSQL with connection pooling (PgBouncer)
- CDN for static assets
- Message queue (RabbitMQ/Kafka) for IoT data ingestion
- Microservice decomposition

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | ~100ms |
| Concurrent Devices | 1000+ | 10-50 |
| Data Points/Day | 1M+ | ~100K |
| Dashboard Load | < 2s | ~1.5s |
| Alert Latency | < 5s | ~2s |

## IoT Data Flow

### Telemetry Pipeline

```
ESP32 Sensor Read (1s interval)
    │
    ▼
Local Processing (ESP32)
    ├── Read analog/digital pins
    ├── Calculate risk/health/quality score
    ├── Update OLED display
    ├── Control LEDs and buzzer
    └── Buffer for transmission
    │
    ▼ (every 10 seconds)
HTTP POST to Backend
    │
    ▼
FastAPI Request Handler
    ├── Validate JSON payload
    ├── Auto-register device if new
    ├── Store to PostgreSQL
    ├── Run alert rule evaluation
    │   └── 9 rule checks per reading
    ├── Generate alerts if thresholds exceeded
    └── Return 201 with reading ID
    │
    ▼
React Dashboard (polling)
    ├── Fetch latest readings
    ├── Update charts and widgets
    ├── Display new alerts
    └── Update device status indicators
```

### Data Transformation

```
Raw Sensor Data        →    Database Record         →    Dashboard Display
─────────────────           ─────────────────           ──────────────────
temperature: 5.4       →    temperature: 5.4       →    "Temp: 5.4C"
humidity: 64.2         →    humidity: 64.2          →    "Hum: 64.2%"
riskScore: 18          →    risk_score: 18          →    "Risk: 18 (SAFE)"
status: "SAFE"         →    status: "SAFE"          →    Green badge
deviceId: "COLD_01"    →    device_id: "COLD_01"    →    Device card
```
