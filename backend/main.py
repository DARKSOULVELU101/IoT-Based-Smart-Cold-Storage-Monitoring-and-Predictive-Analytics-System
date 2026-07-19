import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from passlib.context import CryptContext

from src.config import get_settings
from src.database import engine, Base, AsyncSessionLocal
from src.models import User, UserRole
from src.routes import devices, readings, analytics, alerts, reports, auth, export
from src.middleware.auth import get_password_hash

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            admin = User(
                username="admin",
                email="admin@coldstorage.com",
                hashed_password=pwd_context.hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin)
            await db.commit()

    yield

    await engine.dispose()


app = FastAPI(
    title="Cold Storage Monitoring API",
    description="IoT Cold Storage Monitoring System - Backend API for ESP32 telemetry, analytics, alerts, and reporting",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(devices.router)
app.include_router(readings.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(export.router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "cold-storage-api",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    return {
        "service": "Cold Storage Monitoring API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "readings": "POST /api/readings (ESP32 telemetry - no auth)",
            "devices": "/api/devices",
            "analytics": "/api/analytics",
            "alerts": "/api/alerts",
            "reports": "/api/reports",
            "export": "/api/export/excel",
            "auth": "/api/auth/login",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
