# Render Deployment Guide

## Prerequisites
- GitHub account
- Render account (https://render.com)
- Neon PostgreSQL database (https://neon.tech)

## Step 1: Create Neon Database
1. Sign up at https://neon.tech
2. Click "Create Project"
3. Choose a region close to your users
4. Copy the connection string (it looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`)
5. **Important**: Add `-pooler` to the hostname for connection pooling: `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require`

## Step 2: Push Code to GitHub
```bash
cd "C:\Users\naren\Downloads\my ai folder\iot prj"
git init
git add .
git commit -m "Initial commit: IoT Cold Storage Monitoring System"
git remote add origin https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy Backend on Render
1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `iot-cold-storage-api`
   - **Region**: US East (or nearest)
   - **Branch**: main
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | DATABASE_URL | Your Neon connection string |
   | JWT_SECRET | Any random string (e.g., `openssl rand -hex 32`) |
   | JWT_ALGORITHM | HS256 |
   | JWT_EXPIRATION_MINUTES | 1440 |
   | CORS_ORIGINS | `https://your-vercel-app.vercel.app` |
   | PYTHON_VERSION | 3.11.0 |

6. Click "Create Web Service"
7. Wait for deployment to complete (usually 3-5 minutes)
8. Your backend URL will be: `https://iot-cold-storage-api.onrender.com`

## Step 4: Update Wokwi Firmware
1. Open your Wokwi project
2. In `sketch.ino`, replace the API_URL:
```cpp
const char* API_URL = "https://iot-cold-storage-api.onrender.com/api/readings";
```
3. Run the simulation - telemetry will now be sent to your live backend

## Step 5: Update Frontend Environment
1. In your Vercel project settings, update the environment variable:
   - `VITE_API_URL` = `https://iot-cold-storage-api.onrender.com`
2. Redeploy the frontend

## Troubleshooting

### Backend won't start
- Check build logs in Render dashboard
- Ensure `requirements.txt` is in the `backend/` directory
- Verify DATABASE_URL is correct and includes `?sslmode=require`

### CORS errors
- Add your Vercel URL to `CORS_ORIGINS` environment variable in Render
- Format: `https://your-app.vercel.app`

### Database connection errors
- Ensure Neon database is not paused (free tier pauses after inactivity)
- Check that connection string includes `-pooler` and `?sslmode=require`

### ESP32 not sending data
- Verify the API_URL in sketch.ino matches your Render backend URL
- Check Render logs for incoming requests
- Ensure the POST /api/readings endpoint is working (test with curl)

## Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Neon free tier has usage limits
- Consider upgrading for production use
