import numpy as np
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from src.database.models import SensorReading

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


class PredictiveEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_readings(self, device_id: str, hours: int = 168) -> list:
        start = datetime.utcnow() - timedelta(hours=hours)
        result = await self.db.execute(
            select(SensorReading)
            .where(
                and_(
                    SensorReading.device_id == device_id,
                    SensorReading.created_at >= start,
                )
            )
            .order_by(SensorReading.created_at)
        )
        return list(result.scalars().all())

    def _risk_score(self, value, low, high):
        if value is None:
            return 0
        return min(max((value - low) / (high - low), 0), 1)

    async def predict_spoilage_risk(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 10:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        temps = np.array([r.temperature for r in readings if r.temperature is not None])
        humids = np.array([r.humidity for r in readings if r.humidity is not None])

        if len(temps) < 5:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient temperature data"}

        recent = temps[-24:] if len(temps) >= 24 else temps
        trend = np.polyfit(range(len(recent)), recent, 1)[0]

        temp_score = self._risk_score(float(np.mean(recent)), 2, 8) * 40
        humidity_score = 0
        if len(humids) > 0:
            humidity_score = self._risk_score(float(np.mean(humids[-24:] if len(humids) >= 24 else humids)), 40, 70) * 30
        trend_score = min(max(trend * 10, 0), 1) * 30

        spoilage_risk = temp_score + humidity_score + trend_score

        if spoilage_risk > 70:
            risk_level = "high"
        elif spoilage_risk > 40:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "risk_level": risk_level,
            "spoilage_score": round(spoilage_risk, 2),
            "temperature_trend": "rising" if trend > 0.1 else "falling" if trend < -0.1 else "stable",
            "avg_temperature_72h": round(float(np.mean(temps)), 2),
            "avg_humidity_72h": round(float(np.mean(humids)), 2) if len(humids) > 0 else None,
        }

    async def predict_compressor_failure(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=168)
        if len(readings) < 20:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        currents = np.array([r.compressor_current for r in readings if r.compressor_current is not None and r.compressor_on])
        if len(currents) < 10:
            return {"risk_level": "low", "confidence": 0.5, "message": "Limited compressor data"}

        mean_current = np.mean(currents)
        std_current = np.std(currents)
        recent = currents[-20:]
        trend = np.polyfit(range(len(recent)), recent, 1)[0]

        stability_score = 70 if std_current > 1.5 else 40 if std_current > 0.8 else 10
        trend_score = 60 if trend > 0.1 else 30 if trend > 0.05 else 10
        failure_risk = (stability_score + trend_score) / 2

        if failure_risk > 50:
            risk_level = "high"
        elif failure_risk > 25:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "risk_level": risk_level,
            "failure_score": round(failure_risk, 2),
            "mean_current": round(float(mean_current), 2),
            "current_stability": round(float(std_current), 2),
            "current_trend": "increasing" if trend > 0.05 else "decreasing" if trend < -0.05 else "stable",
        }

    async def predict_machine_failure(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=168)
        if len(readings) < 20:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        vibrations = [r.vibration for r in readings if r.vibration is not None]
        currents = [r.current for r in readings if r.current is not None]
        voltages = [r.voltage for r in readings if r.voltage is not None]

        if len(vibrations) < 10:
            return {"risk_level": "low", "confidence": 0.5, "message": "Limited sensor data"}

        vib_arr = np.array(vibrations)
        cur_arr = np.array(currents) if currents else np.array([0])
        volt_arr = np.array(voltages) if voltages else np.array([220])

        vib_risk = self._risk_score(float(np.mean(vib_arr[-20:])), 5, 10) * 40
        cur_risk = self._risk_score(float(np.mean(cur_arr[-20:])), 10, 15) * 30
        volt_risk = (1 - self._risk_score(float(np.mean(volt_arr[-20:])), 180, 220)) * 30

        failure_score = vib_risk + cur_risk + volt_risk
        risk_level = "high" if failure_score > 70 else "medium" if failure_score > 40 else "low"

        return {
            "risk_level": risk_level,
            "failure_score": round(failure_score, 2),
            "avg_vibration": round(float(np.mean(vib_arr)), 2),
            "avg_current": round(float(np.mean(cur_arr)), 2),
            "avg_voltage": round(float(np.mean(volt_arr)), 2),
        }

    async def predict_water_quality(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 10:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        phs = [r.ph for r in readings if r.ph is not None]
        tdss = [r.tds for r in readings if r.tds is not None]

        if len(phs) < 5:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient pH data"}

        ph_arr = np.array(phs)
        tds_arr = np.array(tdss) if tdss else np.array([0])

        ph_risk = 0
        mean_ph = float(np.mean(ph_arr))
        if mean_ph < 6.5:
            ph_risk = self._risk_score(mean_ph, 4, 6.5) * 50
        elif mean_ph > 8.5:
            ph_risk = self._risk_score(mean_ph, 8.5, 12) * 50

        tds_risk = self._risk_score(float(np.mean(tds_arr)), 300, 500) * 50 if len(tdss) > 0 else 0

        quality_score = ph_risk + tds_risk
        risk_level = "high" if quality_score > 60 else "medium" if quality_score > 30 else "low"

        return {
            "risk_level": risk_level,
            "quality_score": round(quality_score, 2),
            "avg_ph": round(mean_ph, 2),
            "avg_tds": round(float(np.mean(tds_arr)), 2) if len(tdss) > 0 else None,
            "ph_status": "normal" if 6.5 <= mean_ph <= 8.5 else "abnormal",
        }

    async def predict_warehouse_conditions(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 10:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        temps = [r.temperature for r in readings if r.temperature is not None]
        humids = [r.humidity for r in readings if r.humidity is not None]
        air_quals = [r.air_quality for r in readings if r.air_quality is not None]

        if len(temps) < 5:
            return {"risk_level": "unknown", "confidence": 0, "message": "Insufficient data"}

        temp_arr = np.array(temps)
        temp_risk = 0
        mean_temp = float(np.mean(temp_arr))
        if mean_temp > 35:
            temp_risk = self._risk_score(mean_temp, 35, 50) * 40
        elif mean_temp < 5:
            temp_risk = (1 - self._risk_score(mean_temp, 5, -10)) * 40

        humid_risk = 0
        if humids:
            humid_risk = self._risk_score(float(np.mean(humids)), 60, 80) * 30

        air_risk = 0
        if air_quals:
            air_risk = (1 - self._risk_score(float(np.mean(air_quals)), 50, 100)) * 30

        condition_score = temp_risk + humid_risk + air_risk
        risk_level = "high" if condition_score > 60 else "medium" if condition_score > 30 else "low"

        return {
            "risk_level": risk_level,
            "condition_score": round(condition_score, 2),
            "avg_temperature": round(mean_temp, 2),
            "avg_humidity": round(float(np.mean(humids)), 2) if humids else None,
            "avg_air_quality": round(float(np.mean(air_quals)), 2) if air_quals else None,
        }

    async def detect_anomalies(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 30:
            return {"anomalies": [], "message": "Insufficient data for anomaly detection"}

        features = []
        for r in readings:
            row = [
                r.temperature or 0,
                r.humidity or 0,
                r.gas_level or 0,
                r.compressor_current or 0,
                r.risk_score or 0,
                r.vibration or 0,
                r.current or 0,
                r.voltage or 0,
                r.ph or 7,
                r.tds or 0,
            ]
            features.append(row)

        features = np.array(features)
        mean = np.mean(features, axis=0)
        std = np.std(features, axis=0)
        std[std == 0] = 1
        z_scores = np.abs((features - mean) / std)
        anomaly_mask = np.any(z_scores > 2.5, axis=1)

        anomalies = []
        for i, is_anomaly in enumerate(anomaly_mask):
            if is_anomaly:
                r = readings[i]
                anomalies.append({
                    "timestamp": r.created_at.isoformat() if r.created_at else None,
                    "device_id": r.device_id,
                    "module_type": r.module_type,
                    "risk_score": r.risk_score,
                })

        return {
            "device_id": device_id,
            "total_readings": len(readings),
            "anomaly_count": len(anomalies),
            "anomaly_rate": round(len(anomalies) / max(len(readings), 1) * 100, 2),
            "anomalies": anomalies[-20:],
        }

    async def forecast_temperature(self, device_id: str, hours: int = 24) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 20:
            return {"forecast": [], "message": "Insufficient data for forecasting"}

        temps = np.array([r.temperature for r in readings if r.temperature is not None])
        if len(temps) < 10:
            return {"forecast": [], "message": "Insufficient temperature data"}

        X = np.arange(len(temps)).reshape(-1, 1)
        y = temps
        coeffs = np.polyfit(X.flatten(), y, 1)
        slope, intercept = coeffs

        forecast = []
        last_idx = len(temps)
        for h in range(1, hours + 1):
            predicted = slope * (last_idx + h) + intercept
            predicted = max(0, min(predicted, 50))
            forecast_time = readings[-1].created_at + timedelta(hours=h) if readings[-1].created_at else None
            forecast.append({
                "hour": h,
                "predicted_temperature": round(float(predicted), 2),
                "timestamp": forecast_time.isoformat() if forecast_time else None,
            })

        return {
            "device_id": device_id,
            "forecast_hours": hours,
            "current_trend": "warming" if slope > 0.01 else "cooling" if slope < -0.01 else "stable",
            "trend_rate": round(float(slope), 4),
            "forecast": forecast,
        }

    async def forecast_humidity(self, device_id: str, hours: int = 24) -> dict:
        readings = await self._get_readings(device_id, hours=72)
        if len(readings) < 20:
            return {"forecast": [], "message": "Insufficient data for forecasting"}

        humids = np.array([r.humidity for r in readings if r.humidity is not None])
        if len(humids) < 10:
            return {"forecast": [], "message": "Insufficient humidity data"}

        X = np.arange(len(humids)).reshape(-1, 1)
        y = humids
        coeffs = np.polyfit(X.flatten(), y, 1)
        slope, intercept = coeffs

        forecast = []
        last_idx = len(humids)
        for h in range(1, hours + 1):
            predicted = slope * (last_idx + h) + intercept
            predicted = max(0, min(predicted, 100))
            forecast_time = readings[-1].created_at + timedelta(hours=h) if readings[-1].created_at else None
            forecast.append({
                "hour": h,
                "predicted_humidity": round(float(predicted), 2),
                "timestamp": forecast_time.isoformat() if forecast_time else None,
            })

        return {
            "device_id": device_id,
            "forecast_hours": hours,
            "current_trend": "increasing" if slope > 0.1 else "decreasing" if slope < -0.1 else "stable",
            "trend_rate": round(float(slope), 4),
            "forecast": forecast,
        }

    async def get_predictions(self, device_id: str) -> dict:
        readings = await self._get_readings(device_id, hours=1)
        module_type = readings[0].module_type if readings else "cold_storage"

        result = {
            "device_id": device_id,
            "module_type": module_type,
            "generated_at": datetime.utcnow().isoformat(),
            "anomaly_detection": {},
        }

        anomalies = await self.detect_anomalies(device_id)
        result["anomaly_detection"] = {
            "anomaly_count": anomalies.get("anomaly_count", 0),
            "anomaly_rate": anomalies.get("anomaly_rate", 0),
        }

        if module_type == "cold_storage":
            result["spoilage_risk"] = await self.predict_spoilage_risk(device_id)
            result["compressor_failure_risk"] = await self.predict_compressor_failure(device_id)
            result["temperature_forecast"] = await self.forecast_temperature(device_id, hours=24)
            result["humidity_forecast"] = await self.forecast_humidity(device_id, hours=24)
        elif module_type == "machine_health":
            result["failure_prediction"] = await self.predict_machine_failure(device_id)
            result["vibration_forecast"] = await self.forecast_temperature(device_id, hours=24)
        elif module_type == "water_quality":
            result["quality_prediction"] = await self.predict_water_quality(device_id)
        elif module_type == "warehouse":
            result["condition_prediction"] = await self.predict_warehouse_conditions(device_id)
            result["temperature_forecast"] = await self.forecast_temperature(device_id, hours=24)

        return result
