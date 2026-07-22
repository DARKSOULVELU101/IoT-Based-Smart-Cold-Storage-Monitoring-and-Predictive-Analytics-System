from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
import os

from .database import engine, Base, get_db
from .models import Device, TelemetryReading, Alert, DeviceConfig, User, DeviceStatus
from .routers import devices, telemetry, analytics, alerts, reports, dashboard, auth

app = FastAPI(
    title="IoT Monitoring API",
    description="Industrial IoT Analytics Suite - Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "https://iot-analytics-suite.vercel.app",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["Telemetry"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("App will start but database operations will fail until connection is restored")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "IoT Monitoring API", "version": "1.0.0"}


@app.post("/api/seed")
def seed(db: Session = Depends(get_db)):
    from .services.seed_data import seed_database
    return seed_database(db)
