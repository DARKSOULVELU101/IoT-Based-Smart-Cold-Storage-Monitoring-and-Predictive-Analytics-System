from typing import List, Dict, Any
from datetime import datetime, timedelta


def _readings_to_dicts(readings: list) -> List[dict]:
    return [
        {
            "timestamp": r.created_at,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "door_open": 1 if r.door_open else 0,
            "door_open_seconds": r.door_open_seconds,
            "power_available": 1 if r.power_available else 0,
            "gas_level": r.gas_level,
            "compressor_current": r.compressor_current,
            "compressor_on": 1 if r.compressor_on else 0,
            "risk_score": r.risk_score,
        }
        for r in readings
    ]


def predict_spoilage_risk(readings: list) -> Dict[str, Any]:
    if len(readings) < 10:
        return {"risk_level": "UNKNOWN", "risk_score": 0, "message": "Insufficient data (need 10+ readings)"}

    data = _readings_to_dicts(readings)

    try:
        from sklearn.ensemble import IsolationForest
        import numpy as np

        features = np.array([
            [d["temperature"], d["humidity"], d["door_open"], d["gas_level"], d["risk_score"]]
            for d in data
        ])

        clf = IsolationForest(contamination=0.1, random_state=42)
        clf.fit(features)

        latest = features[-1:]
        prediction = clf.predict(latest)[0]
        score = clf.decision_function(latest)[0]

        risk_score = max(0, min(100, int((1 - score) * 100)))
        risk_level = "HIGH" if prediction == -1 else "LOW"

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "anomaly_detected": prediction == -1,
            "model_score": round(float(score), 4),
            "message": "Anomaly detected - spoilage risk elevated" if prediction == -1 else "Normal conditions",
        }
    except ImportError:
        return _simple_spoilage_check(data)


def _simple_spoilage_check(data: list) -> dict:
    latest = data[-1]
    risk = 0

    if latest["temperature"] > 8:
        risk += 30
    elif latest["temperature"] < 0:
        risk += 20

    if latest["humidity"] > 70:
        risk += 20

    if latest["door_open"]:
        risk += 15

    if latest["power_available"] == 0:
        risk += 25

    risk_level = "HIGH" if risk > 60 else "MEDIUM" if risk > 30 else "LOW"
    return {"risk_level": risk_level, "risk_score": min(100, risk), "anomaly_detected": risk > 60, "message": f"Simple rule-based check: {risk_level} risk"}


def predict_compressor_failure(readings: list) -> Dict[str, Any]:
    if len(readings) < 5:
        return {"prediction": "UNKNOWN", "message": "Insufficient data"}

    data = _readings_to_dicts(readings)
    compressor_readings = [d for d in data if d["compressor_on"]]

    if not compressor_readings:
        return {"prediction": "N/A", "message": "No compressor activity recorded"}

    currents = [d["compressor_current"] for d in compressor_readings]
    avg_current = sum(currents) / len(currents)
    max_current = max(currents)
    recent_currents = currents[-5:]
    trend = sum(recent_currents) / len(recent_currents) - avg_current

    if max_current > 10:
        return {"prediction": "CRITICAL", "message": f"Current spike detected: {max_current}A", "avg_current": round(avg_current, 2), "max_current": round(max_current, 2)}

    if trend > 2:
        return {"prediction": "WARNING", "message": f"Upward trend in current: +{round(trend, 2)}A", "avg_current": round(avg_current, 2), "trend": round(trend, 2)}

    if avg_current > 6:
        return {"prediction": "WARNING", "message": f"Elevated average current: {round(avg_current, 2)}A", "avg_current": round(avg_current, 2)}

    return {"prediction": "NORMAL", "message": "Compressor operating within normal parameters", "avg_current": round(avg_current, 2), "max_current": round(max_current, 2)}


def detect_abnormal_temperature(readings: list) -> Dict[str, Any]:
    if len(readings) < 10:
        return {"anomalies": [], "message": "Insufficient data (need 10+ readings)"}

    data = _readings_to_dicts(readings)
    temps = [d["temperature"] for d in data]

    sorted_temps = sorted(temps)
    n = len(sorted_temps)
    q1 = sorted_temps[n // 4]
    q3 = sorted_temps[3 * n // 4]
    iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    anomalies = []
    for i, temp in enumerate(temps):
        if temp < lower_bound or temp > upper_bound:
            anomalies.append({
                "index": i,
                "temperature": temp,
                "bound": "upper" if temp > upper_bound else "lower",
                "threshold": round(upper_bound if temp > upper_bound else lower_bound, 2),
            })

    return {
        "anomalies": anomalies,
        "anomaly_count": len(anomalies),
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2),
        "mean": round(sum(temps) / len(temps), 2),
        "std_dev": round((sum((t - sum(temps) / len(temps)) ** 2 for t in temps) / len(temps)) ** 0.5, 2),
        "message": f"Found {len(anomalies)} abnormal temperature events",
    }


def predict_future_temperature(readings: list, steps_ahead: int = 10) -> Dict[str, Any]:
    if len(readings) < 5:
        return {"predictions": [], "message": "Insufficient data (need 5+ readings)"}

    data = _readings_to_dicts(readings)
    temps = [d["temperature"] for d in data]

    try:
        from sklearn.linear_model import LinearRegression
        import numpy as np

        X = np.array(range(len(temps))).reshape(-1, 1)
        y = np.array(temps)

        model = LinearRegression()
        model.fit(X, y)

        future_X = np.array(range(len(temps), len(temps) + steps_ahead)).reshape(-1, 1)
        predictions = model.predict(future_X)

        return {
            "predictions": [round(float(p), 2) for p in predictions],
            "slope": round(float(model.coef_[0]), 4),
            "intercept": round(float(model.intercept_), 2),
            "r_squared": round(float(model.score(X, y)), 4),
            "message": f"Predicted {steps_ahead} future temperature values",
        }
    except ImportError:
        avg = sum(temps) / len(temps)
        return {
            "predictions": [round(avg, 2)] * steps_ahead,
            "slope": 0,
            "r_squared": 0,
            "message": "Using simple average (scikit-learn not available)",
        }


def predict_future_humidity(readings: list, steps_ahead: int = 10) -> Dict[str, Any]:
    if len(readings) < 5:
        return {"predictions": [], "message": "Insufficient data (need 5+ readings)"}

    data = _readings_to_dicts(readings)
    humids = [d["humidity"] for d in data]

    try:
        from sklearn.linear_model import LinearRegression
        import numpy as np

        X = np.array(range(len(humids))).reshape(-1, 1)
        y = np.array(humids)

        model = LinearRegression()
        model.fit(X, y)

        future_X = np.array(range(len(humids), len(humids) + steps_ahead)).reshape(-1, 1)
        predictions = model.predict(future_X)

        return {
            "predictions": [round(float(p), 2) for p in predictions],
            "slope": round(float(model.coef_[0]), 4),
            "intercept": round(float(model.intercept_), 2),
            "r_squared": round(float(model.score(X, y)), 4),
            "message": f"Predicted {steps_ahead} future humidity values",
        }
    except ImportError:
        avg = sum(humids) / len(humids)
        return {
            "predictions": [round(avg, 2)] * steps_ahead,
            "slope": 0,
            "r_squared": 0,
            "message": "Using simple average (scikit-learn not available)",
        }
