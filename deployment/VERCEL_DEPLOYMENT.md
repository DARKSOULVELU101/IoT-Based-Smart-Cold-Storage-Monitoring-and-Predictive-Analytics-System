# Vercel Deployment Guide

## Prerequisites
- GitHub account with the project repository
- Vercel account (https://vercel.com)

## Step 1: Push Code to GitHub
```bash
cd "C:\Users\naren\Downloads\my ai folder\iot prj"
git init
git add .
git commit -m "Initial commit: IoT Cold Storage Monitoring System"
git remote add origin https://github.com/DARKSOULVELU101/IoT-Based-Smart-Cold-Storage-Monitoring-and-Predictive-Analytics-System.git
git branch -M main
git push -u origin main
```

## Step 2: Import Project on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Find and select the repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | VITE_API_URL | `https://iot-cold-storage-api.onrender.com` |

6. Click "Deploy"
7. Wait for deployment (usually 1-2 minutes)
8. Your frontend URL will be: `https://your-project-name.vercel.app`

## Step 3: Update Backend CORS
1. Go to your Render backend service
2. Update the `CORS_ORIGINS` environment variable to include your Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```
3. The backend will auto-redeploy

## Step 4: Update Wokwi Firmware
Replace the API_URL in sketch.ino with your backend URL:
```cpp
const char* API_URL = "https://your-backend-url.onrender.com/api/readings";
```

## Custom Domain (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
