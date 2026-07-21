from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from src.database.models import SensorReading, Analytics, Device

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


class AnalyticsEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def calculate_daily_stats(self, device_id: str, date: datetime) -> Optional[dict]:
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        result = await self.db.execute(
            select(SensorReading).where(
                and_(
                    SensorReading.device_id == device_id,
                    SensorReading.created_at >= day_start,
                    SensorReading.created_at < day_end,
                )
            )
        )
        readings = result.scalars().all()
        if not readings:
            return None

        module_type = readings[0].module_type if readings else "cold_storage"
        temps = [r.temperature for r in readings if r.temperature is not None]
        humids = [r.humidity for r in readings if r.humidity is not None]
        risk_scores = [r.risk_score for r in readings]

        stats = {
            "device_id": device_id,
            "module_type": module_type,
            "date": day_start.isoformat(),
            "avg_temp": round(sum(temps) / len(temps), 2) if temps else None,
            "min_temp": round(min(temps), 2) if temps else None,
            "max_temp": round(max(temps), 2) if temps else None,
            "avg_humidity": round(sum(humids) / len(humids), 2) if humids else None,
            "avg_risk_score": round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else 0,
            "total_readings": len(readings),
        }

        if module_type == "cold_storage":
            door_events = sum(1 for r in readings if r.door_open)
            door_duration = sum(r.door_open_seconds for r in readings if r.door_open_seconds)
            compressor_count = sum(1 for r in readings if r.compressor_on)
            power_failures = sum(1 for r in readings if r.power_available is not None and not r.power_available)
            stats.update({
                "door_open_count": door_events,
                "door_open_duration": door_duration,
                "compressor_runtime": compressor_count * 5,
                "power_failure_count": power_failures,
            })
        elif module_type == "machine_health":
            vibrations = [r.vibration for r in readings if r.vibration is not None]
            currents = [r.current for r in readings if r.current is not None]
            voltages = [r.voltage for r in readings if r.voltage is not None]
            rpms = [r.rpm for r in readings if r.rpm is not None]
            stats.update({
                "avg_vibration": round(sum(vibrations) / len(vibrations), 2) if vibrations else None,
                "avg_current": round(sum(currents) / len(currents), 2) if currents else None,
                "avg_voltage": round(sum(voltages) / len(voltages), 2) if voltages else None,
                "avg_rpm": round(sum(rpms) / len(rpms), 2) if rpms else None,
            })
        elif module_type == "water_quality":
            phs = [r.ph for r in readings if r.ph is not None]
            tdss = [r.tds for r in readings if r.tds is not None]
            flow_rates = [r.flow_rate for r in readings if r.flow_rate is not None]
            water_levels = [r.water_level for r in readings if r.water_level is not None]
            stats.update({
                "avg_ph": round(sum(phs) / len(phs), 2) if phs else None,
                "avg_tds": round(sum(tdss) / len(tdss), 2) if tdss else None,
                "avg_flow_rate": round(sum(flow_rates) / len(flow_rates), 2) if flow_rates else None,
                "avg_water_level": round(sum(water_levels) / len(water_levels), 2) if water_levels else None,
            })
        elif module_type == "warehouse":
            motions = sum(1 for r in readings if r.motion_detected)
            air_qualities = [r.air_quality for r in readings if r.air_quality is not None]
            occupancies = [r.occupancy for r in readings if r.occupancy is not None]
            lux_vals = [r.lux for r in readings if r.lux is not None]
            stats.update({
                "motion_event_count": motions,
                "avg_air_quality": round(sum(air_qualities) / len(air_qualities), 2) if air_qualities else None,
                "avg_occupancy": round(sum(occupancies) / len(occupancies), 2) if occupancies else None,
                "avg_lux": round(sum(lux_vals) / len(lux_vals), 2) if lux_vals else None,
            })

        existing = await self.db.execute(
            select(Analytics).where(
                and_(Analytics.device_id == device_id, Analytics.date == day_start)
            )
        )
        existing_analytics = existing.scalar_one_or_none()
        if existing_analytics:
            for key, value in stats.items():
                if key not in ("device_id", "date", "module_type") and hasattr(existing_analytics, key) and value is not None:
                    setattr(existing_analytics, key, value)
        else:
            analytics = Analytics(device_id=device_id, module_type=module_type, date=day_start)
            for key, value in stats.items():
                if key not in ("device_id", "date", "module_type") and hasattr(analytics, key) and value is not None:
                    setattr(analytics, key, value)
            self.db.add(analytics)

        await self.db.flush()
        return stats

    async def get_zone_comparison(self, module_type: str = None) -> List[dict]:
        devices_query = select(Device)
        if module_type and module_type in VALID_MODULE_TYPES:
            devices_query = devices_query.where(Device.module_type == module_type)
        devices_result = await self.db.execute(devices_query)
        devices = devices_result.scalars().all()

        zones = {}
        for device in devices:
            if device.zone not in zones:
                zones[device.zone] = []
            latest = await self.db.execute(
                select(SensorReading)
                .where(SensorReading.device_id == device.device_id)
                .order_by(desc(SensorReading.created_at))
                .limit(1)
            )
            reading = latest.scalar_one_or_none()
            if reading:
                zones[device.zone].append(reading)

        comparison = []
        for zone, readings in zones.items():
            if not readings:
                continue
            temps = [r.temperature for r in readings if r.temperature is not None]
            humids = [r.humidity for r in readings if r.humidity is not None]
            risk_scores = [r.risk_score for r in readings]
            comparison.append({
                "zone": zone,
                "device_count": len(readings),
                "avg_temperature": round(sum(temps) / len(temps), 2) if temps else None,
                "avg_humidity": round(sum(humids) / len(humids), 2) if humids else None,
                "avg_risk_score": round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else 0,
                "max_temperature": round(max(temps), 2) if temps else None,
                "min_temperature": round(min(temps), 2) if temps else None,
            })
        return comparison

    async def get_module_comparison(self) -> List[dict]:
        comparison = []
        for mt in VALID_MODULE_TYPES:
            devices_result = await self.db.execute(
                select(Device).where(Device.module_type == mt)
            )
            devices = devices_result.scalars().all()
            device_count = len(devices)
            active_count = sum(1 for d in devices if d.status == "active")

            total_readings_result = await self.db.execute(
                select(func.count(SensorReading.id)).where(SensorReading.module_type == mt)
            )
            total_readings = total_readings_result.scalar() or 0

            from src.database.models import Alert
            active_alerts_result = await self.db.execute(
                select(func.count(Alert.id)).where(
                    and_(Alert.module_type == mt, Alert.acknowledged == False)
                )
            )
            active_alerts = active_alerts_result.scalar() or 0

            latest_readings = []
            for device in devices:
                result = await self.db.execute(
                    select(SensorReading)
                    .where(SensorReading.device_id == device.device_id)
                    .order_by(desc(SensorReading.created_at))
                    .limit(1)
                )
                r = result.scalar_one_or_none()
                if r:
                    latest_readings.append(r)

            avg_risk = 0
            if latest_readings:
                avg_risk = round(sum(r.risk_score for r in latest_readings) / len(latest_readings), 2)

            comparison.append({
                "module_type": mt,
                "device_count": device_count,
                "active_devices": active_count,
                "total_readings": total_readings,
                "active_alerts": active_alerts,
                "avg_risk_score": avg_risk,
            })
        return comparison

    async def get_dashboard_summary(self) -> dict:
        module_counts = {}
        for mt in VALID_MODULE_TYPES:
            result = await self.db.execute(
                select(func.count(Device.id)).where(Device.module_type == mt)
            )
            module_counts[mt] = result.scalar() or 0

        total_result = await self.db.execute(select(func.count(Device.id)))
        total_devices = total_result.scalar() or 0

        active_result = await self.db.execute(
            select(func.count(Device.id)).where(Device.status == "active")
        )
        active_devices = active_result.scalar() or 0

        from src.database.models import Alert
        alerts_result = await self.db.execute(
            select(func.count(Alert.id)).where(Alert.acknowledged == False)
        )
        active_alerts = alerts_result.scalar() or 0

        readings_result = await self.db.execute(select(func.count(SensorReading.id)))
        total_readings = readings_result.scalar() or 0

        return {
            "total_devices": total_devices,
            "active_devices": active_devices,
            "devices_by_module": module_counts,
            "active_alerts": active_alerts,
            "total_readings": total_readings,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_risk_trend(self, device_id: str, days: int = 7) -> List[dict]:
        start_date = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(Analytics)
            .where(
                and_(Analytics.device_id == device_id, Analytics.date >= start_date)
            )
            .order_by(Analytics.date)
        )
        analytics_records = result.scalars().all()
        return [
            {
                "date": a.date.isoformat(),
                "avg_risk_score": a.avg_risk_score,
                "avg_temp": a.avg_temp,
                "avg_humidity": a.avg_humidity,
                "power_failure_count": a.power_failure_count,
            }
            for a in analytics_records
        ]

    async def get_energy_consumption(self, device_id: str) -> dict:
        result = await self.db.execute(
            select(Analytics).where(Analytics.device_id == device_id)
        )
        records = result.scalars().all()
        total_runtime = sum(r.compressor_runtime or 0 for r in records)
        avg_daily = total_runtime / max(len(records), 1)
        estimated_kwh = total_runtime * 0.003
        return {
            "device_id": device_id,
            "total_compressor_minutes": total_runtime,
            "avg_daily_compressor_minutes": round(avg_daily, 2),
            "estimated_total_kwh": round(estimated_kwh, 2),
            "days_tracked": len(records),
        }
