from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import os

from .database import engine, Base, get_db, SessionLocal
from .routers import devices, telemetry, analytics, alerts, reports, dashboard, auth, audit_logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from sqlalchemy import inspect, text as sa_text
        inspector = inspect(engine)
        existing_tables = set(inspector.get_table_names())
        if "devices" in existing_tables and "audit_logs" not in existing_tables:
            conn = engine.connect()
            try:
                for table in ["audit_logs", "alerts", "telemetry_readings", "device_configs", "devices", "users"]:
                    conn.execute(sa_text(f"DROP TABLE IF EXISTS public.{table} CASCADE"))
                for enum_name in ["devicetype", "devicestatus", "alerttype", "alertseverity"]:
                    conn.execute(sa_text(f"DROP TYPE IF EXISTS public.{enum_name} CASCADE"))
                conn.commit()
            except Exception as e:
                print(f"Startup cleanup failed: {e}")
                try:
                    conn.rollback()
                except Exception:
                    pass
            finally:
                conn.close()
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
app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["Audit Logs"])


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "IoT Monitoring API", "version": "1.0.0"}


@app.post("/api/seed")
def seed(db: Session = Depends(get_db)):
    from sqlalchemy import inspect, text as sa_text
    inspector = inspect(engine)
    existing = set(inspector.get_table_names())
    needs_rebuild = "audit_logs" not in existing or "devices" in existing
    if needs_rebuild:
        conn = engine.connect()
        try:
            for table in ["audit_logs", "alerts", "telemetry_readings", "device_configs", "devices", "users"]:
                conn.execute(sa_text(f"DROP TABLE IF EXISTS public.{table} CASCADE"))
            for enum_name in ["devicetype", "devicestatus", "alerttype", "alertseverity"]:
                conn.execute(sa_text(f"DROP TYPE IF EXISTS public.{enum_name} CASCADE"))
            conn.commit()
        except Exception as e:
            print(f"Cleanup failed: {e}")
            try:
                conn.rollback()
            except Exception:
                pass
        finally:
            conn.close()
    Base.metadata.create_all(bind=engine)
    from .services.seed_data import seed_database
    return seed_database(db)


@app.get("/api/debug/schema")
def debug_schema():
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        result = {}
        for t in tables:
            cols = [c["name"] for c in inspector.get_columns(t)]
            result[t] = cols
        return {"tables": tables, "columns": result}
    except Exception as e:
        return {"error": str(e)}


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
