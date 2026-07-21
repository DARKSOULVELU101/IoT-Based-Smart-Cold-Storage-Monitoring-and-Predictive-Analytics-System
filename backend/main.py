import os
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from src.config import settings
from src.database.connection import engine, Base, AsyncSessionLocal
from src.middleware.rate_limit import RateLimitMiddleware
from src.routes import auth, devices, readings, alerts, analytics, export, reports
from src.routes import dashboard, maintenance
from src.middleware.auth import hash_password
from sqlalchemy import select
from src.database.models import User

connected_websockets: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.username == settings.ADMIN_USERNAME)
        )
        existing = result.scalar_one_or_none()
        if not existing:
            admin = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
            session.add(admin)
            await session.commit()

    yield

    await engine.dispose()


app = FastAPI(
    title="IoT Analytics Suite",
    description="Enterprise IoT Analytics Suite API - Multi-module telemetry, alerting, analytics, and reporting for Cold Storage, Machine Health, Water Quality, and Warehouse modules",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, requests_per_minute=120)

app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(readings.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(maintenance.router)


@app.get("/")
async def root():
    return {
        "name": "IoT Analytics Suite",
        "version": "2.0.0",
        "status": "running",
        "modules": ["cold_storage", "machine_health", "water_quality", "warehouse"],
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "modules": ["cold_storage", "machine_health", "water_quality", "warehouse"],
        "connected_clients": len(connected_websockets),
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"echo": data, "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
    except Exception:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)


async def broadcast_to_websockets(message: dict):
    disconnected = []
    for ws in connected_websockets:
        try:
            await ws.send_json(message)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        connected_websockets.remove(ws)
