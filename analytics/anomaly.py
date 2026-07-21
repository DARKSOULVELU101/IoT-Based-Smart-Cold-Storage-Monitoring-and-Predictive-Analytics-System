"""
Anomaly detection module for IoT Analytics Suite.

Combines Isolation Forest, Z-score, and IQR methods for robust
anomaly detection across all IoT modules.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

MODULE_FEATURES: Dict[str, List[str]] = {
    "cold_storage": ["temperature", "humidity", "door_events", "compressor_current", "runtime"],
    "machine_health": ["vibration", "temperature", "current", "voltage"],
    "water_quality": ["ph", "tds", "flow_rate", "temperature"],
    "warehouse": ["temperature", "humidity", "occupancy", "aqi"],
}

MODULE_DEFAULTS: Dict[str, List[float]] = {
    "cold_storage": [-20.0, 50.0, 5.0, 3.5, 1000.0],
    "machine_health": [1.5, 45.0, 4.0, 230.0],
    "water_quality": [7.0, 300.0, 5.0, 20.0],
    "warehouse": [22.0, 45.0, 1.0, 50.0],
}


class AnomalyDetector:
    """Multi-method anomaly detector for IoT sensor data.

    Combines Isolation Forest (ML-based), Z-score (statistical),
    and IQR (robust statistical) methods. All three must agree or
    a weighted vote determines the final label.

    Parameters
    ----------
    contamination : float
        Expected fraction of anomalies in the training data (0-0.5).
    z_threshold : float
        Number of standard deviations for Z-score flagging.
    iqr_multiplier : float
        IQR multiplier for the box-plot fence rule.
    """

    def __init__(
        self,
        contamination: float = 0.1,
        z_threshold: float = 3.0,
        iqr_multiplier: float = 1.5,
    ) -> None:
        self.contamination = contamination
        self.z_threshold = z_threshold
        self.iqr_multiplier = iqr_multiplier

        self._isolation_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=150,
            max_features=1.0,
        )
        self._scaler = StandardScaler()
        self._fitted = False
        self._feature_names: List[str] = []
        self._feature_means: Optional[np.ndarray] = None
        self._feature_stds: Optional[np.ndarray] = None
        self._iqr_lower: Optional[np.ndarray] = None
        self._iqr_upper: Optional[np.ndarray] = None

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def fit(self, data: np.ndarray) -> None:
        """Fit the detector on historical data.

        Parameters
        ----------
        data : array-like of shape (n_samples, n_features)
            Training sensor readings.
        """
        try:
            X = np.asarray(data, dtype=float)
            if X.ndim == 1:
                X = X.reshape(-1, 1)
            self._scaler.fit(X)
            X_scaled = self._scaler.transform(X)
            self._isolation_forest.fit(X_scaled)
            self._feature_means = np.mean(X_scaled, axis=0)
            self._feature_stds = np.std(X_scaled, axis=0) + 1e-10
            q1 = np.percentile(X_scaled, 25, axis=0)
            q3 = np.percentile(X_scaled, 75, axis=0)
            iqr = q3 - q1 + 1e-10
            self._iqr_lower = q1 - self.iqr_multiplier * iqr
            self._iqr_upper = q3 + self.iqr_multiplier * iqr
            self._fitted = True
            logger.info(
                "AnomalyDetector fitted on %d samples, %d features",
                X.shape[0], X.shape[1],
            )
        except Exception as exc:
            logger.error("AnomalyDetector.fit failed: %s", exc)
            self._fitted = False

    def fit_from_dicts(self, readings: List[Dict[str, float]], module_type: str = "cold_storage") -> None:
        """Fit from a list of reading dicts for a given module type."""
        features = MODULE_FEATURES.get(module_type, list(MODULE_DEFAULTS.keys())[0] if False else [])
        if not features:
            features = list(readings[0].keys()) if readings else []
        if not features:
            return
        self._feature_names = features
        rows = []
        for r in readings:
            rows.append([float(r.get(f, 0.0)) for f in features])
        if rows:
            self.fit(np.array(rows))

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict(self, data: np.ndarray) -> np.ndarray:
        """Return anomaly labels: +1 = normal, -1 = anomaly.

        Parameters
        ----------
        data : array-like of shape (n_samples, n_features)
        """
        try:
            X = np.asarray(data, dtype=float)
            if X.ndim == 1:
                X = X.reshape(1, -1)
            if self._fitted:
                X_scaled = self._scaler.transform(X)
                return self._isolation_forest.predict(X_scaled)
            return np.ones(X.shape[0], dtype=int)
        except Exception as exc:
            logger.error("AnomalyDetector.predict failed: %s", exc)
            return np.array([])

    # ------------------------------------------------------------------
    # Combined detection
    # ------------------------------------------------------------------

    def _zscore_flags(self, X_scaled: np.ndarray) -> np.ndarray:
        """Return boolean array: True where any feature exceeds Z-threshold."""
        z = np.abs((X_scaled - self._feature_means) / self._feature_stds)
        return np.any(z > self.z_threshold, axis=1)

    def _iqr_flags(self, X_scaled: np.ndarray) -> np.ndarray:
        """Return boolean array: True where any feature is outside IQR fences."""
        below = np.any(X_scaled < self._iqr_lower, axis=1)
        above = np.any(X_scaled > self._iqr_upper, axis=1)
        return below | above

    def detect_readings(
        self,
        module_type: str,
        readings: List[Dict[str, float]],
    ) -> List[Dict[str, Any]]:
        """Detect anomalies across a batch of readings for a module.

        Parameters
        ----------
        module_type : str
            One of ``cold_storage``, ``machine_health``, ``water_quality``, ``warehouse``.
        readings : list of dict
            Sensor reading dicts.

        Returns
        -------
        list of dict
            Each dict contains ``index``, ``is_anomaly``, ``score``,
            ``methods_triggered``, and the original ``readings``.
        """
        features = MODULE_FEATURES.get(module_type, [])
        defaults = MODULE_DEFAULTS.get(module_type, [])
        if not features or not readings:
            return []

        rows = []
        for r in readings:
            rows.append([float(r.get(f, d)) for f, d in zip(features, defaults)])
        X = np.array(rows, dtype=float)

        results: List[Dict[str, Any]] = []

        if self._fitted:
            X_scaled = self._scaler.transform(X)
            if_labels = self._isolation_forest.predict(X_scaled)
            if_scores = -self._isolation_forest.decision_function(X_scaled)
            z_flags = self._zscore_flags(X_scaled)
            iqr_flags = self._iqr_flags(X_scaled)

            for i in range(len(readings)):
                methods: List[str] = []
                votes = 0
                if if_labels[i] == -1:
                    methods.append("isolation_forest")
                    votes += 1
                if z_flags[i]:
                    methods.append("zscore")
                    votes += 1
                if iqr_flags[i]:
                    methods.append("iqr")
                    votes += 1
                is_anomaly = votes >= 2 or (votes >= 1 and float(if_scores[i]) > 0.5)
                score = float(np.clip(
                    0.5 * float(if_scores[i]) / 1.0
                    + 0.25 * (1.0 if z_flags[i] else 0.0)
                    + 0.25 * (1.0 if iqr_flags[i] else 0.0),
                    0, 1,
                ))
                results.append({
                    "index": i,
                    "is_anomaly": is_anomaly,
                    "score": round(score, 4),
                    "methods_triggered": methods,
                    "readings": readings[i],
                })
        else:
            for i, r in enumerate(readings):
                is_anomaly, score = self._fallback_detect(module_type, r)
                results.append({
                    "index": i,
                    "is_anomaly": is_anomaly,
                    "score": round(score, 4),
                    "methods_triggered": ["rule_based"],
                    "readings": r,
                })
        return results

    def _fallback_detect(
        self,
        module_type: str,
        reading: Dict[str, float],
    ) -> Tuple[bool, float]:
        """Simple rule-based fallback when the model is not fitted."""
        if module_type == "cold_storage":
            temp = reading.get("temperature", -20.0)
            if temp > 10 or temp < -30:
                return True, 0.8
        elif module_type == "machine_health":
            vib = reading.get("vibration", 1.0)
            if vib > 4.0:
                return True, 0.7
        elif module_type == "water_quality":
            ph = reading.get("ph", 7.0)
            if ph < 5.0 or ph > 9.0:
                return True, 0.75
        elif module_type == "warehouse":
            aqi = reading.get("aqi", 50.0)
            if aqi > 200:
                return True, 0.8
        return False, 0.1

    # ------------------------------------------------------------------
    # Feature importance
    # ------------------------------------------------------------------

    def get_feature_importance(self) -> Dict[str, float]:
        """Return per-feature importance derived from the fitted scaler stats.

        Features with higher relative standard deviation in training data
        contribute more to anomaly detection.
        """
        if not self._fitted or self._feature_stds is None:
            return {}
        names = self._feature_names if self._feature_names else [
            f"feature_{i}" for i in range(len(self._feature_stds))
        ]
        total = float(np.sum(self._feature_stds))
        if total == 0:
            return {n: 0.0 for n in names}
        importance = self._feature_stds / total
        return {n: round(float(v), 4) for n, v in zip(names, importance)}
