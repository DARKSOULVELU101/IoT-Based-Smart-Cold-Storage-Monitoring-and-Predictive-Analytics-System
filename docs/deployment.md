# Deployment Guide

## Architecture Overview

```
ESP32 (Wokwi) → FastAPI Backend (Render) → PostgreSQL (Neon)
                                                ↓
                                    React Dashboard (Vercel)
```

## 1. Database Setup (Neon PostgreSQL)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project named `coldstorage`
3. Copy the connection string from the dashboard
4. Run `deployment/neon-setup.sql` in the Neon SQL editor to create all tables

## 2. Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (free tier works)

### Steps

1. **Push code to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend"
   git remote add origin https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System.git
   git push -u origin main
   ```

2. **Create Render Web Service**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Name: `cold-storage-api`
     - Runtime: Python
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/coldstorage?sslmode=require
   SECRET_KEY=<generate-random-64-char-string>
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://cold-storage-api.onrender.com`

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/coldstorage?sslmode=require` |
| SECRET_KEY | JWT secret key (64+ chars) | `a1b2c3d4e5f6...` |
| CORS_ORIGINS | Allowed frontend origins | `["https://your-app.vercel.app"]` |

## 3. Frontend Deployment (Vercel)

### Steps

1. **Update API URL**
   - In `frontend/src/services/api.ts`, ensure the base URL is configured

2. **Push frontend code**

3. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - New Project → Import GitHub repository
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://cold-storage-api.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Note your frontend URL: `https://cold-storage-dashboard.vercel.app`

6. **Update Backend CORS**
   - Go back to Render
   - Update `CORS_ORIGINS` to include your Vercel URL
   - Redeploy

## 4. Wokwi Integration

1. Open your Wokwi project at [wokwi.com](https://wokwi.com)
2. In `sketch.ino`, replace the API_URL:
   ```cpp
   const char* API_URL = "https://cold-storage-api.onrender.com/api/readings";
   ```
3. Run the simulation
4. Telemetry will be sent to your deployed backend every 10 seconds

## 5. Post-Deployment Checklist

- [ ] Database tables created in Neon
- [ ] Backend deployed and responding at `/health`
- [ ] Frontend deployed and loading
- [ ] CORS configured correctly
- [ ] Login works with default credentials (admin / admin123)
- [ ] ESP32 sends data to backend
- [ ] Dashboard shows real-time data
- [ ] Alerts fire correctly
- [ ] Excel export works
- [ ] Reports generate correctly

## 6. Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |

**Change these immediately in production!**

## 7. Domain Configuration (Optional)

### Custom Domain on Vercel
1. Go to your Vercel project settings
2. Add your custom domain
3. Update DNS records as instructed

### Custom Domain on Render
1. Go to your Render service settings
2. Add custom domain
3. Update DNS records

## 8. Monitoring

- **Render**: Built-in logs and metrics at dashboard
- **Vercel**: Analytics and function logs at dashboard
- **Neon**: Query metrics and connection pool stats at dashboard

## 9. Scaling

### Free Tier Limits
- **Render**: 750 hours/month, spins down after 15 min inactivity
- **Vercel**: 100GB bandwidth, serverless functions included
- **Neon**: 0.5 GB storage, 24/7 compute (free tier)

### Upgrading
- Render: Scale to paid plan for always-on
- Vercel: Pro plan for custom domains and more bandwidth
- Neon: Scale compute and storage as needed
