"""
Analytics engine for IoT Analytics Suite.

Orchestrates data processing, KPI calculation, anomaly detection,
and trend analysis across all four IoT modules.
"""

import logging
from typing import Dict, Any, List, Optional

import numpy as np
import pandas as pd

from .models import (
    ColdStoragePredictor,
    MachineHealthPredictor,
    WaterQualityPredictor,
    WarehousePredictor,
)
from .anomaly import AnomalyDetector, MODULE_FEATURES, MODULE_DEFAULTS
from .risk import RiskEngine
from .predictor import TimeSeriesPredictor
from .recommendations import RecommendationEngine

logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """Central analytics engine that ties together all sub-modules.

    Provides high-level methods to process raw sensor data from each
    IoT module, compute KPIs, detect anomalies, and generate trend
    analyses.

    Usage
    -----
    >>> engine = AnalyticsEngine()
    >>> result = engine.process_cold_storage_data(readings)
    """

    def __init__(self) -> None:
        self._cold = ColdStoragePredictor()
        self._machine = MachineHealthPredictor()
        self._water = WaterQualityPredictor()
        self._warehouse = WarehousePredictor()
        self._anomaly = AnomalyDetector(contamination=0.1)
        self._risk = RiskEngine()
        self._predictor = TimeSeriesPredictor()
        self._reco = RecommendationEngine()

    # ==================================================================
    # Module-specific processing
    # ==================================================================

    def process_cold_storage_data(
        self,
        readings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Process a batch of cold-storage readings into a full analytics dict."""
        if not readings:
            return {"module": "cold_storage", "readings_count": 0, "analytics": {}}

        temps = [float(r.get("temperature", 0.0)) for r in readings]
        humids = [float(r.get("humidity", 50.0)) for r in readings]
        doors = [float(r.get("door_events", 0.0)) for r in readings]
        currents = [float(r.get("compressor_current", 3.5)) for r in readings]
        runtimes = [float(r.get("runtime", 0.0)) for r in readings]

        latest = readings[-1]
        is_anomaly, anomaly_score = self._cold.detect_anomaly(latest)
        spoilage_risk = self._cold.predict_spoilage(
            np.array(temps), np.array(humids), np.array(doors)
        )
        compressor_risk = self._cold.predict_compressor_failure(
            np.array(currents), float(np.mean(runtimes)) if runtimes else 0.0
        )
        compliance = self._cold.calculate_cold_chain_compliance(readings)
        risk_score, risk_factors = self._risk.calculate_cold_storage_risk(latest)
        risk_level = self._risk.get_risk_level(risk_score)
        recommendations = self._reco.get_cold_storage_recommendations(
            risk_factors,
            {"spoilage_risk": spoilage_risk, "compliance_score": compliance,
             "compressor_failure_risk": compressor_risk},
        )
        return {
            "module": "cold_storage",
            "readings_count": len(readings),
            "analytics": {
                "is_anomaly": is_anomaly,
                "anomaly_score": anomaly_score,
                "spoilage_risk": spoilage_risk,
                "compressor_failure_risk": compressor_risk,
                "cold_chain_compliance": compliance,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "summary": {
                    "avg_temperature": round(float(np.mean(temps)), 2),
                    "min_temperature": round(float(np.min(temps)), 2),
                    "max_temperature": round(float(np.max(temps)), 2),
                    "avg_humidity": round(float(np.mean(humids)), 2),
                    "total_door_events": int(sum(doors)),
                    "avg_compressor_current": round(float(np.mean(currents)), 2),
                },
            },
        }

    def process_machine_health_data(
        self,
        readings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Process a batch of machine-health readings."""
        if not readings:
            return {"module": "machine_health", "readings_count": 0, "analytics": {}}

        vibs = [float(r.get("vibration", 1.0)) for r in readings]
        temps = [float(r.get("temperature", 40.0)) for r in readings]
        curs = [float(r.get("current", 4.0)) for r in readings]
        vols = [float(r.get("voltage", 230.0)) for r in readings]

        latest = readings[-1]
        is_anomaly, anomaly_score = self._machine.detect_anomaly(latest)
        failure_prob = self._machine.predict_failure(
            np.array(vibs), np.array(temps), np.array(curs), np.array(vols)
        )
        rul = self._machine.predict_remaining_useful_life(readings)
        health_score = self._machine.calculate_health_score(
            float(np.mean(vibs)), float(np.mean(temps)),
            float(np.mean(curs)), float(np.mean(vols)),
        )
        risk_score, risk_factors = self._risk.calculate_machine_health_risk(latest)
        risk_level = self._risk.get_risk_level(risk_score)
        recommendations = self._reco.get_machine_health_recommendations(
            risk_factors,
            {"health_score": health_score, "failure_probability": failure_prob,
             "remaining_useful_life": rul},
        )
        return {
            "module": "machine_health",
            "readings_count": len(readings),
            "analytics": {
                "is_anomaly": is_anomaly,
                "anomaly_score": anomaly_score,
                "failure_probability": failure_prob,
                "remaining_useful_life": rul,
                "health_score": health_score,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "summary": {
                    "avg_vibration": round(float(np.mean(vibs)), 3),
                    "max_vibration": round(float(np.max(vibs)), 3),
                    "avg_temperature": round(float(np.mean(temps)), 2),
                    "max_temperature": round(float(np.max(temps)), 2),
                    "avg_current": round(float(np.mean(curs)), 3),
                    "avg_voltage": round(float(np.mean(vols)), 2),
                },
            },
        }

    def process_water_quality_data(
        self,
        readings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Process a batch of water-quality readings."""
        if not readings:
            return {"module": "water_quality", "readings_count": 0, "analytics": {}}

        phs = [float(r.get("ph", 7.0)) for r in readings]
        tdss = [float(r.get("tds", 300.0)) for r in readings]
        flows = [float(r.get("flow_rate", 5.0)) for r in readings]
        temps = [float(r.get("temperature", 20.0)) for r in readings]
        turbidities = [float(r.get("turbidity", 1.0)) for r in readings]

        latest = readings[-1]
        quality_score = self._water.predict_quality(
            latest.get("ph", 7.0), latest.get("tds", 300.0),
            latest.get("flow_rate", 5.0), latest.get("temperature", 20.0),
        )
        contamination_risk = self._water.detect_contamination(
            latest.get("ph", 7.0), latest.get("tds", 300.0),
            latest.get("turbidity", 1.0),
        )
        trend_dir, trend_conf = self._water.predict_trend(np.array(phs))
        safe = self._water.calculate_safe_to_consume(
            latest.get("ph", 7.0), latest.get("tds", 300.0),
            latest.get("temperature", 20.0),
        )
        risk_score, risk_factors = self._risk.calculate_water_quality_risk(latest)
        risk_level = self._risk.get_risk_level(risk_score)
        recommendations = self._reco.get_water_quality_recommendations(
            risk_factors,
            {"contamination_risk": contamination_risk, "safe_to_consume": safe},
        )
        return {
            "module": "water_quality",
            "readings_count": len(readings),
            "analytics": {
                "quality_score": quality_score,
                "contamination_risk": contamination_risk,
                "trend_direction": trend_dir,
                "trend_confidence": trend_conf,
                "safe_to_consume": safe,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "summary": {
                    "avg_ph": round(float(np.mean(phs)), 2),
                    "min_ph": round(float(np.min(phs)), 2),
                    "max_ph": round(float(np.max(phs)), 2),
                    "avg_tds": round(float(np.mean(tdss)), 2),
                    "avg_turbidity": round(float(np.mean(turbidities)), 3),
                    "avg_flow_rate": round(float(np.mean(flows)), 2),
                },
            },
        }

    def process_warehouse_data(
        self,
        readings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Process a batch of warehouse-environment readings."""
        if not readings:
            return {"module": "warehouse", "readings_count": 0, "analytics": {}}

        temps = [float(r.get("temperature", 22.0)) for r in readings]
        humids = [float(r.get("humidity", 45.0)) for r in readings]
        aqis = [float(r.get("aqi", 50.0)) for r in readings]
        occupancies = [float(r.get("occupancy", 1.0)) for r in readings]

        latest = readings[-1]
        is_anomaly, details = self._warehouse.detect_environmental_anomaly(latest)
        occupancy_pred = self._warehouse.predict_occupancy(
            np.array(occupancies), latest.get("hour", 12.0)
        )
        aqi_trend, aqi_risk = self._warehouse.predict_air_quality_trend(np.array(aqis))
        efficiency = self._warehouse.calculate_energy_efficiency(
            latest.get("temperature", 22.0), latest.get("humidity", 45.0), occupancy_pred,
        )
        risk_score, risk_factors = self._risk.calculate_warehouse_risk(latest)
        risk_level = self._risk.get_risk_level(risk_score)
        recommendations = self._reco.get_warehouse_recommendations(
            risk_factors,
            {"energy_efficiency": efficiency},
        )
        return {
            "module": "warehouse",
            "readings_count": len(readings),
            "analytics": {
                "is_anomaly": is_anomaly,
                "anomaly_details": details,
                "occupancy_prediction": occupancy_pred,
                "air_quality_trend": aqi_trend,
                "air_quality_risk": aqi_risk,
                "energy_efficiency": efficiency,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "summary": {
                    "avg_temperature": round(float(np.mean(temps)), 2),
                    "avg_humidity": round(float(np.mean(humids)), 2),
                    "avg_aqi": round(float(np.mean(aqis)), 2),
                    "max_aqi": round(float(np.max(aqis)), 2),
                    "avg_occupancy": round(float(np.mean(occupancies)), 2),
                },
            },
        }

    # ==================================================================
    # Cross-module analytics
    # ==================================================================

    def generate_cross_module_analytics(
        self,
        all_data: Dict[str, List[Dict[str, Any]]],
    ) -> Dict[str, Any]:
        """Generate comparative analytics across all modules.

        Parameters
        ----------
        all_data : dict
            Keys are module names; values are lists of reading dicts.
        """
        results: Dict[str, Any] = {}
        module_results: Dict[str, Any] = {}

        processors = {
            "cold_storage": self.process_cold_storage_data,
            "machine_health": self.process_machine_health_data,
            "water_quality": self.process_water_quality_data,
            "warehouse": self.process_warehouse_data,
        }

        for module_name, processor in processors.items():
            data = all_data.get(module_name, [])
            if data:
                module_results[module_name] = processor(data)

        critical_count = 0
        high_count = 0
        for mod, res in module_results.items():
            analytics = res.get("analytics", {})
            level = analytics.get("risk_level", "low")
            if level == "critical":
                critical_count += 1
            elif level == "high":
                high_count += 1

        results["module_results"] = module_results
        results["overall"] = {
            "modules_analysed": len(module_results),
            "critical_modules": critical_count,
            "high_risk_modules": high_count,
            "overall_risk": "critical" if critical_count > 0 else (
                "high" if high_count > 0 else "low"
            ),
        }
        return results

    # ==================================================================
    # KPIs
    # ==================================================================

    def calculate_kpis(
        self,
        module_type: str,
        readings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Calculate key performance indicators for a module."""
        if not readings:
            return {"module": module_type, "kpis": {}}

        df = pd.DataFrame(readings)
        kpis: Dict[str, Any] = {"module": module_type, "kpis": {}}

        if module_type == "cold_storage":
            if "temperature" in df.columns:
                kpis["kpis"]["avg_temperature"] = round(float(df["temperature"].mean()), 2)
                kpis["kpis"]["temp_std"] = round(float(df["temperature"].std()), 2)
                kpis["kpis"]["temp_excursions"] = int(((df["temperature"] > 5) | (df["temperature"] < -25)).sum())
            if "humidity" in df.columns:
                kpis["kpis"]["avg_humidity"] = round(float(df["humidity"].mean()), 2)
            if "compressor_current" in df.columns:
                kpis["kpis"]["avg_compressor_current"] = round(float(df["compressor_current"].mean()), 2)
                kpis["kpis"]["max_compressor_current"] = round(float(df["compressor_current"].max()), 2)
            compliance = self._cold.calculate_cold_chain_compliance(readings)
            kpis["kpis"]["cold_chain_compliance_pct"] = compliance

        elif module_type == "machine_health":
            if "vibration" in df.columns:
                kpis["kpis"]["avg_vibration"] = round(float(df["vibration"].mean()), 3)
                kpis["kpis"]["max_vibration"] = round(float(df["vibration"].max()), 3)
                kpis["kpis"]["vibration_trend"] = self._simple_trend(df["vibration"].values)
            if "temperature" in df.columns:
                kpis["kpis"]["avg_temperature"] = round(float(df["temperature"].mean()), 2)
                kpis["kpis"]["max_temperature"] = round(float(df["temperature"].max()), 2)
            if "current" in df.columns:
                kpis["kpis"]["avg_current"] = round(float(df["current"].mean()), 3)
            health = self._machine.calculate_health_score(
                float(df["vibration"].mean()) if "vibration" in df.columns else 1.0,
                float(df["temperature"].mean()) if "temperature" in df.columns else 40.0,
                float(df["current"].mean()) if "current" in df.columns else 4.0,
                float(df["voltage"].mean()) if "voltage" in df.columns else 230.0,
            )
            kpis["kpis"]["health_score"] = health

        elif module_type == "water_quality":
            if "ph" in df.columns:
                kpis["kpis"]["avg_ph"] = round(float(df["ph"].mean()), 2)
                kpis["kpis"]["ph_range"] = f"{round(float(df['ph'].min()), 2)}-{round(float(df['ph'].max()), 2)}"
            if "tds" in df.columns:
                kpis["kpis"]["avg_tds"] = round(float(df["tds"].mean()), 2)
                kpis["kpis"]["max_tds"] = round(float(df["tds"].max()), 2)
            if "turbidity" in df.columns:
                kpis["kpis"]["avg_turbidity"] = round(float(df["turbidity"].mean()), 3)
            latest = readings[-1]
            safe = self._water.calculate_safe_to_consume(
                latest.get("ph", 7.0), latest.get("tds", 300.0), latest.get("temperature", 20.0)
            )
            kpis["kpis"]["safe_to_consume"] = safe

        elif module_type == "warehouse":
            if "temperature" in df.columns:
                kpis["kpis"]["avg_temperature"] = round(float(df["temperature"].mean()), 2)
            if "humidity" in df.columns:
                kpis["kpis"]["avg_humidity"] = round(float(df["humidity"].mean()), 2)
            if "aqi" in df.columns:
                kpis["kpis"]["avg_aqi"] = round(float(df["aqi"].mean()), 2)
                kpis["kpis"]["max_aqi"] = round(float(df["aqi"].max()), 2)
            latest = readings[-1]
            eff = self._warehouse.calculate_energy_efficiency(
                latest.get("temperature", 22), latest.get("humidity", 45),
                int(latest.get("occupancy", 1)),
            )
            kpis["kpis"]["energy_efficiency"] = eff

        return kpis

    def _simple_trend(self, values: np.ndarray) -> str:
        """Return 'increasing', 'decreasing', or 'stable'."""
        if len(values) < 3:
            return "stable"
        x = np.arange(len(values)).reshape(-1, 1)
        from sklearn.linear_model import Ridge
        m = Ridge(alpha=1.0)
        m.fit(x, values)
        slope = float(m.coef_[0])
        if slope > 0.01:
            return "increasing"
        elif slope < -0.01:
            return "decreasing"
        return "stable"

    # ==================================================================
    # Anomaly detection
    # ==================================================================

    def detect_anomalies(
        self,
        module_type: str,
        readings: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Detect anomalies in a batch of readings for the given module."""
        return self._anomaly.detect_readings(module_type, readings)

    # ==================================================================
    # Trend analysis
    # ==================================================================

    def generate_trend_analysis(
        self,
        module_type: str,
        readings: List[Dict[str, Any]],
        period: str = "24h",
    ) -> Dict[str, Any]:
        """Generate a trend analysis for the specified module and period."""
        if not readings:
            return {"module": module_type, "period": period, "trends": {}}

        df = pd.DataFrame(readings)
        trends: Dict[str, Any] = {
            "module": module_type,
            "period": period,
            "readings_count": len(readings),
            "trends": {},
        }

        metric_columns: Dict[str, List[str]] = {
            "cold_storage": ["temperature", "humidity", "compressor_current"],
            "machine_health": ["vibration", "temperature", "current", "voltage"],
            "water_quality": ["ph", "tds", "turbidity", "flow_rate"],
            "warehouse": ["temperature", "humidity", "aqi"],
        }

        columns = metric_columns.get(module_type, [])
        for col in columns:
            if col not in df.columns:
                continue
            series = df[col].values.astype(float)
            trend_info: Dict[str, Any] = {
                "current": round(float(series[-1]), 4),
                "mean": round(float(series.mean()), 4),
                "std": round(float(series.std()), 4) if len(series) > 1 else 0.0,
                "min": round(float(series.min()), 4),
                "max": round(float(series.max()), 4),
            }
            if len(series) >= 3:
                direction, confidence = self._water.predict_trend(series)
                trend_info["direction"] = direction
                trend_info["confidence"] = confidence
                slope = self._compute_slope(series)
                trend_info["slope"] = round(slope, 6)
            else:
                trend_info["direction"] = "stable"
                trend_info["confidence"] = 0.0
                trend_info["slope"] = 0.0

            trend_info["volatility"] = round(float(series.std() / (abs(series.mean()) + 1e-10)), 4)
            trends["trends"][col] = trend_info

        return trends

    def _compute_slope(self, series: np.ndarray) -> float:
        """Compute linear slope of a series."""
        x = np.arange(len(series)).reshape(-1, 1)
        from sklearn.linear_model import Ridge
        m = Ridge(alpha=1.0)
        m.fit(x, series)
        return float(m.coef_[0])
