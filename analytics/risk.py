"""
Risk scoring engine for IoT Analytics Suite.

Calculates risk scores for all four IoT modules and provides
risk levels and actionable recommendations.
"""

import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)


class RiskEngine:
    """Rule-based risk scoring engine with configurable thresholds."""

    RISK_THRESHOLDS = {
        "low": (0.0, 0.25),
        "medium": (0.25, 0.50),
        "high": (0.50, 0.75),
        "critical": (0.75, 1.01),
    }

    # ------------------------------------------------------------------
    # Cold storage
    # ------------------------------------------------------------------

    def calculate_cold_storage_risk(
        self,
        reading: Dict[str, float],
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """Return (risk_score, risk_factors) for a cold-storage reading."""
        factors: List[Dict[str, Any]] = []
        score = 0.0

        temp = reading.get("temperature", -20.0)
        if temp > 5.0:
            s = min((temp - 5.0) / 15.0, 1.0) * 0.4
            score += s
            factors.append({"factor": "high_temperature", "value": temp,
                            "threshold": 5.0, "weight": 0.4, "contribution": round(s, 4)})
        elif temp < -25.0:
            s = min(abs(temp + 25.0) / 10.0, 1.0) * 0.25
            score += s
            factors.append({"factor": "low_temperature", "value": temp,
                            "threshold": -25.0, "weight": 0.25, "contribution": round(s, 4)})

        humidity = reading.get("humidity", 50.0)
        if humidity > 90.0:
            s = min((humidity - 90.0) / 10.0, 1.0) * 0.2
            score += s
            factors.append({"factor": "high_humidity", "value": humidity,
                            "threshold": 90.0, "weight": 0.2, "contribution": round(s, 4)})
        elif humidity < 30.0:
            s = min((30.0 - humidity) / 20.0, 1.0) * 0.15
            score += s
            factors.append({"factor": "low_humidity", "value": humidity,
                            "threshold": 30.0, "weight": 0.15, "contribution": round(s, 4)})

        compressor = reading.get("compressor_current", 3.5)
        if compressor > 6.5:
            s = min((compressor - 6.5) / 3.5, 1.0) * 0.25
            score += s
            factors.append({"factor": "compressor_overload", "value": compressor,
                            "threshold": 6.5, "weight": 0.25, "contribution": round(s, 4)})

        door = reading.get("door_events", 0.0)
        if door > 15:
            s = min((door - 15) / 15.0, 1.0) * 0.15
            score += s
            factors.append({"factor": "excessive_door_events", "value": door,
                            "threshold": 15, "weight": 0.15, "contribution": round(s, 4)})

        return round(min(score, 1.0), 4), factors

    # ------------------------------------------------------------------
    # Machine health
    # ------------------------------------------------------------------

    def calculate_machine_health_risk(
        self,
        reading: Dict[str, float],
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """Return (risk_score, risk_factors) for a machine-health reading."""
        factors: List[Dict[str, Any]] = []
        score = 0.0

        vib = reading.get("vibration", 1.0)
        if vib > 2.5:
            s = min((vib - 2.5) / 2.5, 1.0) * 0.35
            score += s
            factors.append({"factor": "high_vibration", "value": vib,
                            "threshold": 2.5, "weight": 0.35, "contribution": round(s, 4)})

        temp = reading.get("temperature", 40.0)
        if temp > 80.0:
            s = min((temp - 80.0) / 40.0, 1.0) * 0.30
            score += s
            factors.append({"factor": "high_temperature", "value": temp,
                            "threshold": 80.0, "weight": 0.30, "contribution": round(s, 4)})

        current = reading.get("current", 4.0)
        if current > 7.0:
            s = min((current - 7.0) / 3.0, 1.0) * 0.20
            score += s
            factors.append({"factor": "overcurrent", "value": current,
                            "threshold": 7.0, "weight": 0.20, "contribution": round(s, 4)})

        voltage = reading.get("voltage", 230.0)
        v_dev = abs(voltage - 230.0) / 230.0
        if v_dev > 0.05:
            s = min((v_dev - 0.05) / 0.10, 1.0) * 0.15
            score += s
            factors.append({"factor": "voltage_deviation", "value": voltage,
                            "threshold": "230 +/- 5%", "weight": 0.15, "contribution": round(s, 4)})

        return round(min(score, 1.0), 4), factors

    # ------------------------------------------------------------------
    # Water quality
    # ------------------------------------------------------------------

    def calculate_water_quality_risk(
        self,
        reading: Dict[str, float],
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """Return (risk_score, risk_factors) for a water-quality reading."""
        factors: List[Dict[str, Any]] = []
        score = 0.0

        ph = reading.get("ph", 7.0)
        ph_dev = abs(ph - 7.0)
        if ph_dev > 1.5:
            s = min((ph_dev - 1.5) / 2.0, 1.0) * 0.35
            score += s
            factors.append({"factor": "ph_out_of_range", "value": ph,
                            "threshold": "6.5-8.5", "weight": 0.35, "contribution": round(s, 4)})

        tds = reading.get("tds", 300.0)
        if tds > 500:
            s = min((tds - 500) / 1000.0, 1.0) * 0.30
            score += s
            factors.append({"factor": "high_tds", "value": tds,
                            "threshold": 500, "weight": 0.30, "contribution": round(s, 4)})

        turbidity = reading.get("turbidity", 1.0)
        if turbidity > 5.0:
            s = min((turbidity - 5.0) / 15.0, 1.0) * 0.25
            score += s
            factors.append({"factor": "high_turbidity", "value": turbidity,
                            "threshold": 5.0, "weight": 0.25, "contribution": round(s, 4)})

        temp = reading.get("temperature", 20.0)
        if temp > 30:
            s = min((temp - 30) / 10.0, 1.0) * 0.10
            score += s
            factors.append({"factor": "high_temperature", "value": temp,
                            "threshold": 30, "weight": 0.10, "contribution": round(s, 4)})

        return round(min(score, 1.0), 4), factors

    # ------------------------------------------------------------------
    # Warehouse
    # ------------------------------------------------------------------

    def calculate_warehouse_risk(
        self,
        reading: Dict[str, float],
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """Return (risk_score, risk_factors) for a warehouse reading."""
        factors: List[Dict[str, Any]] = []
        score = 0.0

        temp = reading.get("temperature", 22.0)
        if temp > 35.0:
            s = min((temp - 35.0) / 10.0, 1.0) * 0.25
            score += s
            factors.append({"factor": "high_temperature", "value": temp,
                            "threshold": 35.0, "weight": 0.25, "contribution": round(s, 4)})
        elif temp < 10.0:
            s = min((10.0 - temp) / 10.0, 1.0) * 0.20
            score += s
            factors.append({"factor": "low_temperature", "value": temp,
                            "threshold": 10.0, "weight": 0.20, "contribution": round(s, 4)})

        humidity = reading.get("humidity", 45.0)
        if humidity > 75.0:
            s = min((humidity - 75.0) / 20.0, 1.0) * 0.20
            score += s
            factors.append({"factor": "high_humidity", "value": humidity,
                            "threshold": 75.0, "weight": 0.20, "contribution": round(s, 4)})
        elif humidity < 20.0:
            s = min((20.0 - humidity) / 20.0, 1.0) * 0.15
            score += s
            factors.append({"factor": "low_humidity", "value": humidity,
                            "threshold": 20.0, "weight": 0.15, "contribution": round(s, 4)})

        aqi = reading.get("aqi", 50.0)
        if aqi > 100:
            s = min((aqi - 100) / 200.0, 1.0) * 0.35
            score += s
            factors.append({"factor": "poor_air_quality", "value": aqi,
                            "threshold": 100, "weight": 0.35, "contribution": round(s, 4)})

        co2 = reading.get("co2", 400.0)
        if co2 > 1000:
            s = min((co2 - 1000) / 1000.0, 1.0) * 0.20
            score += s
            factors.append({"factor": "high_co2", "value": co2,
                            "threshold": 1000, "weight": 0.20, "contribution": round(s, 4)})

        return round(min(score, 1.0), 4), factors

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def get_risk_level(self, score: float) -> str:
        """Map a 0-1 risk score to a human-readable level."""
        for level, (lo, hi) in self.RISK_THRESHOLDS.items():
            if lo <= score < hi:
                return level
        return "critical"

    def get_recommendations(
        self,
        module_type: str,
        risk_factors: List[Dict[str, Any]],
    ) -> List[str]:
        """Return actionable recommendations for the given risk factors."""
        recs: List[str] = []
        factor_names = {f["factor"] for f in risk_factors}

        if module_type == "cold_storage":
            if "high_temperature" in factor_names:
                recs.append("Check refrigeration compressor and coolant levels immediately.")
                recs.append("Reduce door opening frequency to maintain temperature.")
            if "low_temperature" in factor_names:
                recs.append("Investigate possible thermostat malfunction causing overcooling.")
            if "high_humidity" in factor_names:
                recs.append("Inspect door seals and dehumidification system.")
            if "compressor_overload" in factor_names:
                recs.append("Schedule compressor maintenance — current draw is abnormally high.")
            if "excessive_door_events" in factor_names:
                recs.append("Review door access protocols and consider installing air curtains.")

        elif module_type == "machine_health":
            if "high_vibration" in factor_names:
                recs.append("Inspect bearings, alignment, and mounting bolts.")
                recs.append("Schedule a vibration analysis with a specialist.")
            if "high_temperature" in factor_names:
                recs.append("Check lubrication and cooling systems for the machine.")
                recs.append("Reduce load if possible until temperature normalises.")
            if "overcurrent" in factor_names:
                recs.append("Inspect motor windings and power supply for faults.")
            if "voltage_deviation" in factor_names:
                recs.append("Check power supply stability and install surge protection.")

        elif module_type == "water_quality":
            if "ph_out_of_range" in factor_names:
                recs.append("Test water source for contamination; adjust pH dosing.")
            if "high_tds" in factor_names:
                recs.append("Inspect filtration system and consider membrane replacement.")
            if "high_turbidity" in factor_names:
                recs.append("Flush the system and check upstream filtration.")
            if "high_temperature" in factor_names:
                recs.append("Check for heat source near water lines; consider insulation.")

        elif module_type == "warehouse":
            if "high_temperature" in factor_names:
                recs.append("Increase HVAC cooling or activate backup ventilation.")
            if "low_temperature" in factor_names:
                recs.append("Activate heating systems and inspect insulation.")
            if "high_humidity" in factor_names:
                recs.append("Activate dehumidifiers and check for leaks.")
            if "poor_air_quality" in factor_names:
                recs.append("Increase ventilation rate and identify pollution source.")
            if "high_co2" in factor_names:
                recs.append("Open vents or increase fresh-air intake to reduce CO2.")

        if not recs:
            recs.append("No immediate action required — metrics are within normal range.")

        return recs
