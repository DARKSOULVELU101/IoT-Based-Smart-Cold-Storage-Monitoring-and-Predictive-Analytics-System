from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import os

from .database import engine, Base, get_db, SessionLocal
from .routers import devices, telemetry, analytics, alerts, reports, dashboard, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Startup table creation failed: {e}")
    yield


app = FastAPI(
    title="IoT Monitoring API",
    description="Industrial IoT Analytics Suite - Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
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


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "IoT Monitoring API", "version": "1.0.0"}


@app.post("/api/seed")
def seed(db: Session = Depends(get_db)):
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing = set(inspector.get_table_names())
    expected = {"devices", "telemetry_readings", "alerts", "device_configs", "users"}
    if existing and not expected.issubset(existing):
        conn = engine.connect()
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO apiuser;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO coldstorage_user;"))
        conn.commit()
        conn.close()
    Base.metadata.create_all(bind=engine)
    from .services.seed_data import seed_database
    return seed_database(db)


@app.get("/api/debug/db")
def debug_db():
    try:
        from sqlalchemy import text
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        db.close()
        return {"db_connection": "ok"}
    except Exception as e:
        return {"db_connection": "failed", "error": str(e), "type": type(e).__name__}
