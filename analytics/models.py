"""
Machine Learning models for IoT Analytics Suite.

Provides predictive models for four IoT modules:
- Cold Storage Monitoring
- Machine Health Monitoring
- Water Quality Monitoring
- Warehouse Environment Monitoring
"""

import logging
from typing import Tuple, Dict, Any, Optional, List

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


def _safe_train(model, X: np.ndarray, y: Optional[np.ndarray] = None) -> bool:
    try:
        if y is not None:
            model.fit(X, y)
        else:
            model.fit(X)
        return True
    except Exception as exc:
        logger.warning("Model training failed: %s", exc)
        return False


class ColdStoragePredictor:
    """Predictive models for cold storage / refrigeration systems."""

    def __init__(self) -> None:
        self._anomaly_detector = IsolationForest(
            contamination=0.1, random_state=42, n_estimators=100
        )
        self._failure_model = RandomForestClassifier(
            n_estimators=100, random_state=42, max_depth=10
        )
        self._trend_model = Ridge(alpha=1.0)
        self._scaler = StandardScaler()
        self._fitted = False
        self._failure_fitted = False
        self._trend_fitted = False
        self._fit_with_defaults()

    def _fit_with_defaults(self) -> None:
        rng = np.random.RandomState(42)
        n = 200
        X = np.column_stack([
            rng.uniform(-25, 10, n),
            rng.uniform(30, 95, n),
            rng.poisson(5, n),
            rng.uniform(1.0, 8.0, n),
            rng.uniform(0, 8760, n),
        ])
        self._scaler.fit(X)
        X_scaled = self._scaler.transform(X)
        self._anomaly_detector.fit(X_scaled)
        self._fitted = True
        labels = (X[:, 0] > 5).astype(int) | (X[:, 3] > 6.5).astype(int)
        self._failure_model.fit(X_scaled, labels)
        self._failure_fitted = True
        y_trend = -0.001 * X[:, 4] + 0.5 * X[:, 0] + rng.normal(0, 0.1, n)
        self._trend_model.fit(X_scaled, y_trend)
        self._trend_fitted = True

    def predict_spoilage(
        self,
        temperature_history: np.ndarray,
        humidity_history: np.ndarray,
        door_events: np.ndarray,
    ) -> float:
        try:
            t = np.asarray(temperature_history, dtype=float)
            h = np.asarray(humidity_history, dtype=float)
            temp_score = 0.0
            if t.size:
                above_0 = np.clip(t, 0, None)
                temp_score = float(np.mean(above_0)) / 10.0
            humidity_score = 0.0
            if h.size:
                humidity_score = float(np.clip((np.mean(h) - 60) / 40, 0, 1))
            door_count = float(np.sum(np.asarray(door_events, dtype=float)))
            door_score = min(door_count / 20.0, 1.0)
            risk = float(np.clip(
                0.4 * temp_score + 0.35 * humidity_score + 0.25 * door_score, 0, 1
            ))
            return round(risk, 4)
        except Exception as exc:
            logger.error("predict_spoilage failed: %s", exc)
            return 0.0

    def predict_compressor_failure(
        self,
        compressor_current_history: np.ndarray,
        runtime: float,
    ) -> float:
        try:
            c = np.asarray(compressor_current_history, dtype=float)
            if c.size == 0:
                return 0.0
            mean_c = float(np.mean(c))
            std_c = float(np.std(c))
            max_c = float(np.max(c))
            recent = float(np.mean(c[-5:])) if c.size >= 5 else mean_c
            spike_ratio = max_c / mean_c if mean_c > 0 else 1.0
            instability = std_c / mean_c if mean_c > 0 else 0.0
            drift = (recent - mean_c) / mean_c if mean_c > 0 else 0.0
            score = (
                0.3 * min(spike_ratio / 3.0, 1.0)
                + 0.3 * min(instability, 1.0)
                + 0.2 * min(abs(drift), 1.0)
                + 0.2 * min(runtime / 10000.0, 1.0)
            )
            return round(float(np.clip(score, 0, 1)), 4)
        except Exception as exc:
            logger.error("predict_compressor_failure failed: %s", exc)
            return 0.0

    def detect_anomaly(
        self,
        readings: Dict[str, float],
    ) -> Tuple[bool, float]:
        try:
            feature_keys = ["temperature", "humidity", "door_events",
                            "compressor_current", "runtime"]
            values = [float(readings.get(k, 0.0)) for k in feature_keys]
            X = np.array(values, dtype=float).reshape(1, -1)
            if self._fitted:
                X_scaled = self._scaler.transform(X)
                raw_score = self._anomaly_detector.decision_function(X_scaled)[0]
                label = self._anomaly_detector.predict(X_scaled)[0]
                is_anomaly = label == -1
                anomaly_score = float(np.clip(0.5 - raw_score, 0, 1))
                return is_anomaly, round(anomaly_score, 4)
            temp = readings.get("temperature", 0.0)
            is_anomaly = abs(temp) > 15
            return is_anomaly, 0.5
        except Exception as exc:
            logger.error("detect_anomaly failed: %s", exc)
            return False, 0.0

    def calculate_cold_chain_compliance(
        self,
        readings: List[Dict[str, float]],
    ) -> float:
        try:
            if not readings:
                return 100.0
            temps = [r.get("temperature", 0.0) for r in readings]
            out_of_range = sum(1 for t in temps if t > 5.0 or t < -25.0)
            compliance = max(0.0, 100.0 - (out_of_range / len(temps)) * 100.0)
            humidity_violations = sum(
                1 for r in readings
                if r.get("humidity", 50.0) > 90.0 or r.get("humidity", 50.0) < 30.0
            )
            compliance -= (humidity_violations / len(readings)) * 10.0
            return round(max(0.0, min(100.0, compliance)), 2)
        except Exception as exc:
            logger.error("calculate_cold_chain_compliance failed: %s", exc)
            return 0.0


class MachineHealthPredictor:
    """Predictive models for industrial machine health."""

    def __init__(self) -> None:
        self._anomaly_detector = IsolationForest(
            contamination=0.1, random_state=42, n_estimators=100
        )
        self._failure_model = RandomForestClassifier(
            n_estimators=100, random_state=42, max_depth=10
        )
        self._rul_model = Ridge(alpha=1.0)
        self._scaler = StandardScaler()
        self._fitted = False
        self._failure_fitted = False
        self._rul_fitted = False
        self._fit_with_defaults()

    def _fit_with_defaults(self) -> None:
        rng = np.random.RandomState(42)
        n = 300
        X = np.column_stack([
            rng.uniform(0.1, 5.0, n),
            rng.uniform(20, 120, n),
            rng.uniform(1.0, 10.0, n),
            rng.uniform(200, 260, n),
        ])
        self._scaler.fit(X)
        X_scaled = self._scaler.transform(X)
        self._anomaly_detector.fit(X_scaled)
        self._fitted = True
        labels = ((X[:, 0] > 3.5) | (X[:, 1] > 100) | (X[:, 2] > 8.0)).astype(int)
        self._failure_model.fit(X_scaled, labels)
        self._failure_fitted = True
        rul = np.clip(
            1000 - 150 * X[:, 0] - 5 * X[:, 1] - 30 * X[:, 2] + rng.normal(0, 20, n),
            0, 1000,
        )
        self._rul_model.fit(X_scaled, rul)
        self._rul_fitted = True

    def predict_failure(
        self,
        vibration_data: np.ndarray,
        temp_data: np.ndarray,
        current_data: np.ndarray,
        voltage_data: np.ndarray,
    ) -> float:
        try:
            vib = np.asarray(vibration_data, dtype=float)
            tmp = np.asarray(temp_data, dtype=float)
            cur = np.asarray(current_data, dtype=float)
            vol = np.asarray(voltage_data, dtype=float)
            features = np.array([
                float(np.mean(vib)) if vib.size else 1.0,
                float(np.mean(tmp)) if tmp.size else 40.0,
                float(np.mean(cur)) if cur.size else 3.0,
                float(np.mean(vol)) if vol.size else 230.0,
            ]).reshape(1, -1)
            if self._failure_fitted:
                X_scaled = self._scaler.transform(features)
                proba = self._failure_model.predict_proba(X_scaled)[0]
                return round(float(proba[1]), 4)
            risk = 0.0
            if vib.size:
                risk += min(float(np.mean(vib)) / 5.0, 1.0) * 0.4
            if tmp.size:
                risk += min(float(np.mean(tmp)) / 120.0, 1.0) * 0.3
            if cur.size:
                risk += min(float(np.mean(cur)) / 10.0, 1.0) * 0.3
            return round(float(np.clip(risk, 0, 1)), 4)
        except Exception as exc:
            logger.error("predict_failure failed: %s", exc)
            return 0.0

    def predict_remaining_useful_life(
        self,
        reading_history: List[Dict[str, float]],
    ) -> float:
        try:
            if not reading_history:
                return 500.0
            vib = np.array([r.get("vibration", 1.0) for r in reading_history], dtype=float)
            tmp = np.array([r.get("temperature", 40.0) for r in reading_history], dtype=float)
            cur = np.array([r.get("current", 3.0) for r in reading_history], dtype=float)
            vol = np.array([r.get("voltage", 230.0) for r in reading_history], dtype=float)
            features = np.array([
                float(np.mean(vib)),
                float(np.mean(tmp)),
                float(np.mean(cur)),
                float(np.mean(vol)),
            ]).reshape(1, -1)
            if self._rul_fitted:
                X_scaled = self._scaler.transform(features)
                rul = self._rul_model.predict(X_scaled)[0]
                return round(max(0.0, float(rul)), 2)
            base = 500.0
            base -= float(np.mean(vib)) * 50.0
            base -= max(0, float(np.mean(tmp)) - 80.0) * 5.0
            return round(max(0.0, base), 2)
        except Exception as exc:
            logger.error("predict_remaining_useful_life failed: %s", exc)
            return 0.0

    def detect_anomaly(
        self,
        readings: Dict[str, float],
    ) -> Tuple[bool, float]:
        try:
            keys = ["vibration", "temperature", "current", "voltage"]
            values = [float(readings.get(k, 0.0)) for k in keys]
            X = np.array(values).reshape(1, -1)
            if self._fitted:
                X_scaled = self._scaler.transform(X)
                raw = self._anomaly_detector.decision_function(X_scaled)[0]
                label = self._anomaly_detector.predict(X_scaled)[0]
                return label == -1, round(float(np.clip(0.5 - raw, 0, 1)), 4)
            vib = readings.get("vibration", 0.0)
            temp = readings.get("temperature", 40.0)
            is_a = vib > 4.0 or temp > 110.0
            return is_a, 0.5
        except Exception as exc:
            logger.error("detect_anomaly failed: %s", exc)
            return False, 0.0

    def calculate_health_score(
        self,
        vibration: float,
        temp: float,
        current: float,
        voltage: float,
    ) -> float:
        try:
            vib_score = max(0, 100 - (vibration / 5.0) * 100)
            tmp_score = max(0, 100 - max(0, temp - 60) / 60 * 100)
            cur_score = max(0, 100 - max(0, current - 5) / 5 * 100)
            v_dev = abs(voltage - 230) / 230
            vol_score = max(0, 100 - v_dev * 100)
            score = 0.35 * vib_score + 0.30 * tmp_score + 0.20 * cur_score + 0.15 * vol_score
            return round(float(np.clip(score, 0, 100)), 2)
        except Exception as exc:
            logger.error("calculate_health_score failed: %s", exc)
            return 0.0


class WaterQualityPredictor:
    """Predictive models for water quality monitoring."""

    def __init__(self) -> None:
        self._quality_model = Ridge(alpha=1.0)
        self._contamination_model = RandomForestClassifier(
            n_estimators=80, random_state=42, max_depth=8
        )
        self._scaler = StandardScaler()
        self._quality_fitted = False
        self._contam_fitted = False
        self._fit_with_defaults()

    def _fit_with_defaults(self) -> None:
        rng = np.random.RandomState(42)
        n = 250
        X = np.column_stack([
            rng.uniform(4.0, 9.0, n),
            rng.uniform(50, 1500, n),
            rng.uniform(0.5, 10.0, n),
            rng.uniform(5, 35, n),
        ])
        self._scaler.fit(X)
        X_scaled = self._scaler.transform(X)
        quality = (
            100
            - 5 * np.abs(X[:, 0] - 7.0)
            - 0.02 * np.clip(X[:, 1] - 500, 0, None)
            + rng.normal(0, 3, n)
        )
        self._quality_model.fit(X_scaled, quality)
        self._quality_fitted = True
        turbidity = rng.uniform(0, 20, n)
        X_contam = np.column_stack([X, turbidity])
        labels = (
            (X[:, 0] < 5.5) | (X[:, 0] > 8.5) | (X[:, 1] > 1000) | (turbidity > 10)
        ).astype(int)
        self._contamination_model.fit(X_contam, labels)
        self._contam_fitted = True

    def predict_quality(
        self,
        ph: float,
        tds: float,
        flow_rate: float,
        temperature: float,
    ) -> float:
        try:
            X = np.array([[ph, tds, flow_rate, temperature]])
            if self._quality_fitted:
                X_scaled = self._scaler.transform(X)
                score = self._quality_model.predict(X_scaled)[0]
                return round(float(np.clip(score, 0, 100)), 2)
            ph_score = max(0, 100 - 5 * abs(ph - 7.0))
            tds_penalty = max(0, (tds - 500) * 0.02)
            return round(float(np.clip(ph_score - tds_penalty, 0, 100)), 2)
        except Exception as exc:
            logger.error("predict_quality failed: %s", exc)
            return 50.0

    def detect_contamination(
        self,
        ph: float,
        tds: float,
        turbidity: float,
    ) -> float:
        try:
            X = np.array([[ph, tds, 5.0, 20.0, turbidity]])
            if self._contam_fitted:
                proba = self._contamination_model.predict_proba(X)[0]
                return round(float(proba[1]), 4)
            risk = 0.0
            if ph < 5.5 or ph > 8.5:
                risk += 0.4
            if tds > 1000:
                risk += 0.3
            if turbidity > 10:
                risk += 0.3
            return round(min(risk, 1.0), 4)
        except Exception as exc:
            logger.error("detect_contamination failed: %s", exc)
            return 0.0

    def predict_trend(
        self,
        quality_history: np.ndarray,
    ) -> Tuple[str, float]:
        try:
            h = np.asarray(quality_history, dtype=float)
            if h.size < 3:
                return "stable", 0.5
            x = np.arange(h.size).reshape(-1, 1)
            model = Ridge(alpha=1.0)
            model.fit(x, h)
            slope = float(model.coef_[0])
            recent_std = float(np.std(h[-min(5, h.size):]))
            if slope > 0.5:
                direction = "improving"
            elif slope < -0.5:
                direction = "declining"
            else:
                direction = "stable"
            confidence = float(np.clip(1.0 - recent_std / (abs(slope) + 1e-6) * 0.1, 0.1, 0.99))
            return direction, round(confidence, 4)
        except Exception as exc:
            logger.error("predict_trend failed: %s", exc)
            return "stable", 0.0

    def calculate_safe_to_consume(
        self,
        ph: float,
        tds: float,
        temperature: float,
    ) -> bool:
        try:
            ph_ok = 6.5 <= ph <= 8.5
            tds_ok = tds <= 500
            temp_ok = temperature <= 30
            return ph_ok and tds_ok and temp_ok
        except Exception as exc:
            logger.error("calculate_safe_to_consume failed: %s", exc)
            return False


class WarehousePredictor:
    """Predictive models for warehouse environment monitoring."""

    def __init__(self) -> None:
        self._anomaly_detector = IsolationForest(
            contamination=0.1, random_state=42, n_estimators=100
        )
        self._occupancy_model = RandomForestClassifier(
            n_estimators=80, random_state=42, max_depth=8
        )
        self._aqi_model = Ridge(alpha=1.0)
        self._scaler = StandardScaler()
        self._anomaly_fitted = False
        self._occupancy_fitted = False
        self._aqi_fitted = False
        self._fit_with_defaults()

    def _fit_with_defaults(self) -> None:
        rng = np.random.RandomState(42)
        n = 250
        X_env = np.column_stack([
            rng.uniform(15, 35, n),
            rng.uniform(20, 80, n),
            rng.uniform(0, 100, n),
            rng.uniform(0, 300, n),
        ])
        self._scaler.fit(X_env)
        X_scaled = self._scaler.transform(X_env)
        self._anomaly_detector.fit(X_scaled)
        self._anomaly_fitted = True
        motion = rng.poisson(3, n)
        hour = rng.uniform(0, 23, n).astype(int)
        occ_label = ((motion > 2) | ((hour >= 8) & (hour <= 17))).astype(int)
        X_occ = np.column_stack([motion, hour, X_env[:, 2]])
        self._occupancy_model.fit(X_occ, occ_label)
        self._occupancy_fitted = True
        aqi = (
            50
            + 0.5 * X_env[:, 0]
            + 0.3 * X_env[:, 1]
            - 0.1 * X_env[:, 2]
            + rng.normal(0, 5, n)
        )
        self._aqi_model.fit(X_scaled, aqi)
        self._aqi_fitted = True

    def predict_occupancy(
        self,
        motion_history: np.ndarray,
        time_of_day: float,
    ) -> int:
        try:
            motion = np.asarray(motion_history, dtype=float)
            motion_count = float(np.sum(motion)) if motion.size else 0.0
            hour = float(time_of_day) % 24
            if self._occupancy_fitted:
                X = np.array([[motion_count, hour, 50.0]])
                pred = self._occupancy_model.predict(X)[0]
                return int(pred)
            if motion_count > 2 or 8 <= hour <= 17:
                return 1
            return 0
        except Exception as exc:
            logger.error("predict_occupancy failed: %s", exc)
            return 0

    def predict_air_quality_trend(
        self,
        aqi_history: np.ndarray,
    ) -> Tuple[str, str]:
        try:
            h = np.asarray(aqi_history, dtype=float)
            if h.size < 3:
                return "stable", "low"
            x = np.arange(h.size).reshape(-1, 1)
            model = Ridge(alpha=1.0)
            model.fit(x, h)
            slope = float(model.coef_[0])
            current = float(h[-1])
            if slope > 1.0:
                trend = "increasing"
            elif slope < -1.0:
                trend = "decreasing"
            else:
                trend = "stable"
            if current > 150:
                risk = "high"
            elif current > 100:
                risk = "medium"
            else:
                risk = "low"
            return trend, risk
        except Exception as exc:
            logger.error("predict_air_quality_trend failed: %s", exc)
            return "stable", "low"

    def calculate_energy_efficiency(
        self,
        temp: float,
        humidity: float,
        occupancy: int,
    ) -> float:
        try:
            target_temp = 22.0
            temp_eff = max(0, 100 - abs(temp - target_temp) * 5)
            ideal_humidity = 45.0
            hum_eff = max(0, 100 - abs(humidity - ideal_humidity) * 2)
            if occupancy == 0:
                base_score = 80.0
            else:
                base_score = 60.0
            efficiency = 0.4 * temp_eff + 0.3 * hum_eff + 0.3 * base_score
            return round(float(np.clip(efficiency, 0, 100)), 2)
        except Exception as exc:
            logger.error("calculate_energy_efficiency failed: %s", exc)
            return 0.0

    def detect_environmental_anomaly(
        self,
        readings: Dict[str, float],
    ) -> Tuple[bool, Dict[str, Any]]:
        try:
            keys = ["temperature", "humidity", "occupancy", "aqi"]
            values = [float(readings.get(k, 0.0)) for k in keys]
            X = np.array(values).reshape(1, -1)
            details: Dict[str, Any] = {"readings": readings, "flags": []}
            if self._anomaly_fitted:
                X_scaled = self._scaler.transform(X)
                label = self._anomaly_detector.predict(X_scaled)[0]
                raw = self._anomaly_detector.decision_function(X_scaled)[0]
                score = float(np.clip(0.5 - raw, 0, 1))
                is_anomaly = label == -1
            else:
                is_anomaly = False
                score = 0.0
            temp = readings.get("temperature", 22.0)
            if temp > 35 or temp < 10:
                details["flags"].append("extreme_temperature")
            hum = readings.get("humidity", 50.0)
            if hum > 75 or hum < 20:
                details["flags"].append("extreme_humidity")
            aqi = readings.get("aqi", 50.0)
            if aqi > 150:
                details["flags"].append("poor_air_quality")
            details["anomaly_score"] = score
            return is_anomaly, details
        except Exception as exc:
            logger.error("detect_environmental_anomaly failed: %s", exc)
            return False, {"readings": readings, "flags": [], "anomaly_score": 0.0}
