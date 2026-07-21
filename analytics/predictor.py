"""
Time-series prediction module for IoT Analytics Suite.

Uses Linear Regression / Ridge with feature engineering
(rolling averages, time features) for forecasting.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

logger = logging.getLogger(__name__)


def _build_time_features(timestamps: Optional[np.ndarray], n: int) -> np.ndarray:
    """Build cyclic time features from timestamps or synthetic indices."""
    if timestamps is not None and len(timestamps) == n:
        try:
            ts = pd.to_datetime(timestamps)
            hour = ts.hour + ts.minute / 60.0
        except Exception:
            hour = np.arange(n, dtype=float)
    else:
        hour = np.arange(n, dtype=float)

    hour_sin = np.sin(2 * np.pi * hour / 24.0)
    hour_cos = np.cos(2 * np.pi * hour / 24.0)
    return np.column_stack([hour_sin, hour_cos])


def _build_rolling_features(values: np.ndarray, window: int = 5) -> np.ndarray:
    """Compute rolling mean and rolling std with a given window."""
    s = pd.Series(values)
    rmean = s.rolling(window=window, min_periods=1).mean().values
    rstd = s.rolling(window=window, min_periods=1).std().fillna(0).values
    return np.column_stack([rmean, rstd])


def _build_feature_matrix(
    values: np.ndarray,
    timestamps: Optional[np.ndarray] = None,
    window: int = 5,
) -> np.ndarray:
    """Combine lag, rolling, and time features into a feature matrix."""
    n = len(values)
    X_lag = values.reshape(-1, 1)
    X_roll = _build_rolling_features(values, window)
    X_time = _build_time_features(timestamps, n)

    diffs = np.zeros((n, 1))
    diffs[1:] = np.diff(values).reshape(-1, 1)
    return np.hstack([X_lag, X_roll, X_time, diffs])


class TimeSeriesPredictor:
    """Forecast IoT sensor values using Ridge regression with rich features.

    Each ``predict_*`` method accepts a list of reading dicts and
    returns a list of predicted values for the requested horizon.

    Parameters
    ----------
    window : int
        Rolling-window size used for feature engineering.
    """

    def __init__(self, window: int = 5) -> None:
        self.window = window
        self._models: Dict[str, Ridge] = {}
        self._fitted: Dict[str, bool] = {}

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _fit_model(
        self,
        key: str,
        values: np.ndarray,
        timestamps: Optional[np.ndarray] = None,
    ) -> Ridge:
        """Fit (or re-fit) the Ridge model for a given metric key."""
        model = Ridge(alpha=1.0)
        if len(values) < 3:
            self._models[key] = model
            self._fitted[key] = False
            return model
        X = _build_feature_matrix(values, timestamps, self.window)
        y = values
        try:
            model.fit(X, y)
        except Exception as exc:
            logger.warning("Ridge fit failed for %s: %s", key, exc)
        self._models[key] = model
        self._fitted[key] = True
        return model

    def _predict_forward(
        self,
        key: str,
        values: np.ndarray,
        timestamps: Optional[np.ndarray],
        hours_ahead: int,
    ) -> List[Dict[str, Any]]:
        """Recursive multi-step forecast."""
        vals = list(values)
        ts_list: List[Any] = list(timestamps) if timestamps is not None else None
        predictions: List[Dict[str, Any]] = []

        model = self._models.get(key)
        fitted = self._fitted.get(key, False)

        for step in range(1, hours_ahead + 1):
            arr = np.array(vals, dtype=float)
            X = _build_feature_matrix(arr, ts_list if ts_list else None, self.window)
            if fitted:
                pred = float(model.predict(X[-1:, :])[0])
            else:
                recent_mean = float(np.mean(arr[-min(5, len(arr)):]))
                pred = recent_mean + float(np.random.normal(0, 0.1))
            vals.append(pred)

            if ts_list is not None:
                last_ts = pd.Timestamp(ts_list[-1])
                ts_list.append(last_ts + pd.Timedelta(hours=1))

            predictions.append({
                "step": step,
                "predicted_value": round(pred, 4),
            })

        return predictions

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict_temperature(
        self,
        readings: List[Dict[str, Any]],
        hours_ahead: int = 24,
    ) -> List[Dict[str, Any]]:
        """Forecast temperature readings.

        Each reading dict is expected to contain ``temperature`` and
        optionally ``timestamp``.
        """
        try:
            temps = np.array([float(r.get("temperature", 0.0)) for r in readings], dtype=float)
            timestamps = [r.get("timestamp") for r in readings] if readings and "timestamp" in readings[0] else None
            ts_arr = np.array(timestamps) if timestamps else None
            self._fit_model("temperature", temps, ts_arr)
            return self._predict_forward("temperature", temps, ts_arr, hours_ahead)
        except Exception as exc:
            logger.error("predict_temperature failed: %s", exc)
            return [{"step": i + 1, "predicted_value": 0.0} for i in range(hours_ahead)]

    def predict_humidity(
        self,
        readings: List[Dict[str, Any]],
        hours_ahead: int = 24,
    ) -> List[Dict[str, Any]]:
        """Forecast humidity readings."""
        try:
            vals = np.array([float(r.get("humidity", 50.0)) for r in readings], dtype=float)
            timestamps = [r.get("timestamp") for r in readings] if readings and "timestamp" in readings[0] else None
            ts_arr = np.array(timestamps) if timestamps else None
            self._fit_model("humidity", vals, ts_arr)
            return self._predict_forward("humidity", vals, ts_arr, hours_ahead)
        except Exception as exc:
            logger.error("predict_humidity failed: %s", exc)
            return [{"step": i + 1, "predicted_value": 50.0} for i in range(hours_ahead)]

    def predict_quality_score(
        self,
        readings: List[Dict[str, Any]],
        hours_ahead: int = 24,
    ) -> List[Dict[str, Any]]:
        """Forecast water quality score readings."""
        try:
            vals = np.array([float(r.get("quality_score", 80.0)) for r in readings], dtype=float)
            timestamps = [r.get("timestamp") for r in readings] if readings and "timestamp" in readings[0] else None
            ts_arr = np.array(timestamps) if timestamps else None
            self._fit_model("quality_score", vals, ts_arr)
            return self._predict_forward("quality_score", vals, ts_arr, hours_ahead)
        except Exception as exc:
            logger.error("predict_quality_score failed: %s", exc)
            return [{"step": i + 1, "predicted_value": 80.0} for i in range(hours_ahead)]

    def predict_energy_consumption(
        self,
        readings: List[Dict[str, Any]],
        hours_ahead: int = 24,
    ) -> List[Dict[str, Any]]:
        """Forecast energy consumption readings."""
        try:
            vals = np.array([float(r.get("energy_consumption", 50.0)) for r in readings], dtype=float)
            timestamps = [r.get("timestamp") for r in readings] if readings and "timestamp" in readings[0] else None
            ts_arr = np.array(timestamps) if timestamps else None
            self._fit_model("energy_consumption", vals, ts_arr)
            return self._predict_forward("energy_consumption", vals, ts_arr, hours_ahead)
        except Exception as exc:
            logger.error("predict_energy_consumption failed: %s", exc)
            return [{"step": i + 1, "predicted_value": 50.0} for i in range(hours_ahead)]
