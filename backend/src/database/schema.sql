-- Cold Storage Monitoring System - PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE device_status AS ENUM ('active', 'inactive', 'disabled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_level AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE period_type AS ENUM ('hourly', 'daily');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'operator', 'viewer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    zone VARCHAR(50) NOT NULL,
    name VARCHAR(200),
    description TEXT,
    status device_status DEFAULT 'active' NOT NULL,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_zone ON devices(zone);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    zone VARCHAR(50) NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    door_open BOOLEAN DEFAULT FALSE,
    door_open_seconds INTEGER DEFAULT 0,
    power_available BOOLEAN DEFAULT TRUE,
    gas_level INTEGER DEFAULT 0,
    compressor_current FLOAT DEFAULT 0.0,
    compressor_on BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'SAFE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_readings_device_id ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_readings_zone ON sensor_readings(zone);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON sensor_readings(created_at);
CREATE INDEX IF NOT EXISTS idx_readings_device_created ON sensor_readings(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    zone VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    level alert_level NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_zone ON alerts(zone);
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(resolved, created_at DESC) WHERE resolved = FALSE;

CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    zone VARCHAR(50) NOT NULL,
    period_type period_type NOT NULL,
    temperature_avg FLOAT,
    temperature_min FLOAT,
    temperature_max FLOAT,
    humidity_avg FLOAT,
    door_open_count INTEGER DEFAULT 0,
    door_open_duration FLOAT DEFAULT 0.0,
    compressor_runtime FLOAT DEFAULT 0.0,
    power_failure_count INTEGER DEFAULT 0,
    risk_score_avg FLOAT DEFAULT 0.0,
    energy_consumption FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_device_id ON analytics(device_id);
CREATE INDEX IF NOT EXISTS idx_analytics_zone ON analytics(zone);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON analytics(period_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    zone VARCHAR(50),
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content JSONB,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_device_id ON reports(device_id);
CREATE INDEX IF NOT EXISTS idx_reports_zone ON reports(zone);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    hashed_password VARCHAR(300) NOT NULL,
    role user_role DEFAULT 'viewer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
