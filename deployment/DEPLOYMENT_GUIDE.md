# Deployment Guide - Industrial IoT Analytics Suite

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend build |
| Git | 2.x | Version control |
| Neon Account | Free tier | PostgreSQL database |
| Render Account | Free tier | Backend hosting |
| Vercel Account | Free tier | Frontend hosting |

---

## 1. Neon PostgreSQL Setup

### Step 1: Create Account
1. Go to https://neon.tech
2. Sign up with GitHub or email
3. Verify your email

### Step 2: Create Project
1. Click **Create Project**
2. Select a region closest to your users
3. Name the project: `iot-analytics-suite`
4. Copy the connection string (format below)

### Step 3: Get Connection String
```
postgresql://neondb_owner:password@ep-xxx.us-east-2.aws.neon.tech/iot_analytics_suite?sslmode=require
```

**Save this string. You will need it in the next step.**

---

## 2. Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
cd "C:\Users\naren\Downloads\my ai folder\iot prj"
git init
git add .
git commit -m "Initial commit - IoT Analytics Suite"
git remote add origin https://github.com/YOUR_USERNAME/iot-analytics-suite.git
git push -u origin main
```

### Step 2: Create Render Service
1. Go to https://dashboard.render.com
2. Click **New +** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `iot-analytics-suite-api`
   - **Region:** Oregon (or closest to you)
   - **Branch:** `main`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Set Environment Variables
In Render Dashboard > Environment tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (from Neon step above) |
| `JWT_SECRET` | (click Generate) |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRATION_MINUTES` | `1440` |
| `CORS_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_EMAIL` | `admin@your-domain.com` |
| `ADMIN_PASSWORD` | (strong password) |
| `ENABLED_MODULES` | `cold_storage,machine_health,water_quality,warehouse` |

### Step 4: Deploy
1. Click **Create Web Service**
2. Wait for deployment (2-5 minutes)
3. Note your backend URL: `https://iot-analytics-suite-api.onrender.com`

### Step 5: Verify
```bash
curl https://iot-analytics-suite-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "version": "2.0.0"
}
```

---

## 3. Frontend Deployment (Vercel)

### Step 1: Configure Environment
```bash
cd frontend
cp ../deployment/.env.frontend.example .env
```

Edit `.env`:
```
VITE_API_URL=https://iot-analytics-suite-api.onrender.com
VITE_WS_URL=wss://iot-analytics-suite-api.onrender.com/ws
VITE_APP_NAME=Industrial IoT Analytics Suite
```

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Deploy
```bash
cd frontend
vercel --prod
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** (select your account)
- **Link to existing project?** No
- **Project name:** iot-analytics-suite
- **Directory:** `.` (current directory)
- **Override settings?** No

### Step 4: Configure Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://iot-analytics-suite-api.onrender.com` | Production |
| `VITE_WS_URL` | `wss://iot-analytics-suite-api.onrender.com/ws` | Production |
| `VITE_APP_NAME` | `Industrial IoT Analytics Suite` | Production |

### Step 5: Redeploy
After setting env vars, trigger a redeployment:
```bash
vercel --prod
```

Note your frontend URL: `https://iot-analytics-suite.vercel.app`

---

## 4. CORS Configuration

Update the backend's CORS_ORIGINS to include your Vercel URL:

In Render Dashboard > Environment:
```
CORS_ORIGINS=https://iot-analytics-suite.vercel.app,http://localhost:5173
```

The service will auto-redeploy after changes.

---

## 5. Wokwi Simulation Setup

### Step 1: Update Firmware
Open your sketch.ino and update the API URL:

```cpp
const char* API_URL = "https://iot-analytics-suite-api.onrender.com/api/readings";
```

### Step 2: Run Simulation
1. Go to https://wokwi.com
2. Create a new ESP32 project
3. Copy the updated sketch.ino
4. Copy diagram.json from `hardware/cold-storage/`
5. Add required libraries
6. Start simulation

### Step 3: Verify End-to-End
1. Watch serial output for successful API calls (HTTP 201)
2. Open Vercel dashboard - device should appear
3. Sensor readings should populate charts

---

## 6. Post-Deployment Checklist

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads at Vercel URL
- [ ] Login works with admin credentials
- [ ] CORS is configured for Vercel domain
- [ ] Wokwi simulation sends data successfully
- [ ] Devices appear on dashboard automatically
- [ ] Alerts trigger when thresholds are exceeded
- [ ] Charts display real-time data
- [ ] Excel export downloads successfully
- [ ] Reports generate without errors

---

## 7. Custom Domain (Optional)

### Vercel
1. Go to **Settings** > **Domains**
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is auto-provisioned

### Backend
1. Upgrade Render to paid plan for custom domains
2. Add domain in **Settings** > **Custom Domains**
3. Update CORS_ORIGINS with new domain

---

## Troubleshooting

### CORS Error
Ensure `CORS_ORIGINS` on Render matches your exact Vercel URL (with `https://`)

### Database Connection Failed
- Verify `DATABASE_URL` uses `sslmode=require`
- Check Neon project is not paused (free tier pauses after inactivity)

### 502 Bad Gateway
- Check Render logs for Python errors
- Ensure all dependencies are in `requirements.txt`

### Frontend Shows No Data
- Verify `VITE_API_URL` is set correctly
- Check browser console for network errors
- Ensure backend is not sleeping (Render free tier)
