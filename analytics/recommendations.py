"""
AI-powered recommendation engine for IoT Analytics Suite.

Generates actionable recommendations for each module based on
risk factors, analytics results, and device history.
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Context-aware recommendation engine for all IoT modules."""

    # ------------------------------------------------------------------
    # Cold storage
    # ------------------------------------------------------------------

    def get_cold_storage_recommendations(
        self,
        risk_factors: List[Dict[str, Any]],
        analytics: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate cold-storage recommendations from risk factors and analytics."""
        recs: List[Dict[str, Any]] = []
        factor_map = {f["factor"]: f for f in risk_factors}
        compliance = analytics.get("compliance_score", 100.0)
        spoilage_risk = analytics.get("spoilage_risk", 0.0)
        compressor_risk = analytics.get("compressor_failure_risk", 0.0)

        if "high_temperature" in factor_map:
            recs.append({
                "priority": "critical",
                "category": "temperature",
                "action": "Immediately inspect refrigeration system and reduce ambient load.",
                "estimated_impact": "Prevent spoilage of stored goods.",
            })

        if "compressor_overload" in factor_map or compressor_risk > 0.5:
            recs.append({
                "priority": "high",
                "category": "compressor",
                "action": "Schedule emergency compressor maintenance within 24 hours.",
                "estimated_impact": "Avoid unplanned downtime and product loss.",
            })

        if "excessive_door_events" in factor_map:
            recs.append({
                "priority": "medium",
                "category": "operations",
                "action": "Train staff on minimal door-open protocols; install air curtains.",
                "estimated_impact": "Reduce temperature fluctuations by up to 30%.",
            })

        if "high_humidity" in factor_map:
            recs.append({
                "priority": "medium",
                "category": "humidity",
                "action": "Inspect door gaskets and dehumidification unit.",
                "estimated_impact": "Maintain optimal humidity for stored products.",
            })

        if spoilage_risk > 0.5:
            recs.append({
                "priority": "high",
                "category": "quality",
                "action": "Conduct immediate inventory inspection for spoiled products.",
                "estimated_impact": "Minimise financial loss from damaged inventory.",
            })

        if compliance < 80:
            recs.append({
                "priority": "high",
                "category": "compliance",
                "action": "Review cold-chain compliance procedures and retrain staff.",
                "estimated_impact": "Restore compliance score above 80%.",
            })

        if not recs:
            recs.append({
                "priority": "low",
                "category": "general",
                "action": "Continue routine monitoring. All metrics are within normal range.",
                "estimated_impact": "Maintain current operational standards.",
            })

        return recs

    # ------------------------------------------------------------------
    # Machine health
    # ------------------------------------------------------------------

    def get_machine_health_recommendations(
        self,
        risk_factors: List[Dict[str, Any]],
        analytics: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate machine-health recommendations."""
        recs: List[Dict[str, Any]] = []
        factor_map = {f["factor"]: f for f in risk_factors}
        health_score = analytics.get("health_score", 100.0)
        failure_prob = analytics.get("failure_probability", 0.0)
        rul = analytics.get("remaining_useful_life", 500.0)

        if "high_vibration" in factor_map:
            recs.append({
                "priority": "critical",
                "category": "vibration",
                "action": "Perform vibration analysis; inspect bearings, coupling, and alignment.",
                "estimated_impact": "Prevent catastrophic mechanical failure.",
            })

        if "high_temperature" in factor_map:
            recs.append({
                "priority": "high",
                "category": "temperature",
                "action": "Check lubrication, cooling fans, and reduce operational load.",
                "estimated_impact": "Extend component life and prevent thermal damage.",
            })

        if "overcurrent" in factor_map:
            recs.append({
                "priority": "high",
                "category": "electrical",
                "action": "Inspect motor windings, check for short circuits, and verify protection relays.",
                "estimated_impact": "Prevent electrical fire and motor burnout.",
            })

        if "voltage_deviation" in factor_map:
            recs.append({
                "priority": "medium",
                "category": "power",
                "action": "Check power quality, stabiliser settings, and wiring integrity.",
                "estimated_impact": "Ensure consistent machine performance.",
            })

        if failure_prob > 0.7:
            recs.append({
                "priority": "critical",
                "category": "predictive",
                "action": "Schedule immediate shutdown and maintenance inspection.",
                "estimated_impact": "Avoid unplanned production stoppage.",
            })

        if rul < 100:
            recs.append({
                "priority": "high",
                "category": "lifecycle",
                "action": "Plan machine replacement or major overhaul within the next maintenance window.",
                "estimated_impact": "Maintain production continuity.",
            })

        if health_score < 50:
            recs.append({
                "priority": "high",
                "category": "health",
                "action": "Comprehensive machine audit recommended — overall health is poor.",
                "estimated_impact": "Identify root causes and restore performance.",
            })

        if not recs:
            recs.append({
                "priority": "low",
                "category": "general",
                "action": "All machine parameters are normal. Continue routine maintenance schedule.",
                "estimated_impact": "Sustain current operational health.",
            })

        return recs

    # ------------------------------------------------------------------
    # Water quality
    # ------------------------------------------------------------------

    def get_water_quality_recommendations(
        self,
        risk_factors: List[Dict[str, Any]],
        analytics: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate water-quality recommendations."""
        recs: List[Dict[str, Any]] = []
        factor_map = {f["factor"]: f for f in risk_factors}
        safe = analytics.get("safe_to_consume", True)
        contamination = analytics.get("contamination_risk", 0.0)

        if "ph_out_of_range" in factor_map:
            recs.append({
                "priority": "critical",
                "category": "chemistry",
                "action": "Test source water; adjust pH dosing system and flush distribution lines.",
                "estimated_impact": "Restore safe pH levels for consumption.",
            })

        if "high_tds" in factor_map:
            recs.append({
                "priority": "high",
                "category": "filtration",
                "action": "Inspect RO/membrane filtration system; replace filters if due.",
                "estimated_impact": "Reduce dissolved solids to potable levels.",
            })

        if "high_turbidity" in factor_map:
            recs.append({
                "priority": "high",
                "category": "clarity",
                "action": "Backwash filters and inspect upstream intake for sediment intrusion.",
                "estimated_impact": "Restore water clarity and remove particulates.",
            })

        if contamination > 0.5:
            recs.append({
                "priority": "critical",
                "category": "safety",
                "action": "Issue water-use advisory; perform comprehensive contamination screening.",
                "estimated_impact": "Protect consumer health.",
            })

        if not safe:
            recs.append({
                "priority": "critical",
                "category": "consumption",
                "action": "Water is currently NOT safe to consume. Notify all stakeholders immediately.",
                "estimated_impact": "Prevent health incidents.",
            })

        if not recs:
            recs.append({
                "priority": "low",
                "category": "general",
                "action": "Water quality is within safe parameters. Continue routine monitoring.",
                "estimated_impact": "Maintain supply safety.",
            })

        return recs

    # ------------------------------------------------------------------
    # Warehouse
    # ------------------------------------------------------------------

    def get_warehouse_recommendations(
        self,
        risk_factors: List[Dict[str, Any]],
        analytics: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate warehouse-environment recommendations."""
        recs: List[Dict[str, Any]] = []
        factor_map = {f["factor"]: f for f in risk_factors}
        efficiency = analytics.get("energy_efficiency", 100.0)

        if "high_temperature" in factor_map:
            recs.append({
                "priority": "high",
                "category": "temperature",
                "action": "Activate additional cooling zones; check HVAC refrigerant levels.",
                "estimated_impact": "Protect inventory and worker comfort.",
            })

        if "low_temperature" in factor_map:
            recs.append({
                "priority": "medium",
                "category": "temperature",
                "action": "Activate heating; inspect insulation and seal entry points.",
                "estimated_impact": "Prevent cold-related product damage.",
            })

        if "high_humidity" in factor_map:
            recs.append({
                "priority": "high",
                "category": "humidity",
                "action": "Deploy dehumidifiers; check roof and wall integrity for leaks.",
                "estimated_impact": "Prevent mould and moisture damage to inventory.",
            })

        if "poor_air_quality" in factor_map:
            recs.append({
                "priority": "critical",
                "category": "air_quality",
                "action": "Increase ventilation, evacuate personnel if AQI > 200, identify pollution source.",
                "estimated_impact": "Protect worker health and regulatory compliance.",
            })

        if "high_co2" in factor_map:
            recs.append({
                "priority": "high",
                "category": "ventilation",
                "action": "Open fresh-air dampers and check CO2 sensor calibration.",
                "estimated_impact": "Restore safe breathing air levels.",
            })

        if efficiency < 50:
            recs.append({
                "priority": "medium",
                "category": "energy",
                "action": "Audit HVAC scheduling, insulation, and occupancy-based controls for energy savings.",
                "estimated_impact": "Reduce energy costs by up to 20%.",
            })

        if not recs:
            recs.append({
                "priority": "low",
                "category": "general",
                "action": "Warehouse environment is within optimal parameters.",
                "estimated_impact": "Maintain current operating conditions.",
            })

        return recs

    # ------------------------------------------------------------------
    # Maintenance
    # ------------------------------------------------------------------

    def get_maintenance_recommendations(
        self,
        device_history: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate predictive maintenance actions from device history."""
        actions: List[Dict[str, Any]] = []
        uptime = device_history.get("uptime_hours", 0)
        last_service = device_history.get("hours_since_last_service", 0)
        failure_count = device_history.get("failure_count", 0)
        rul = device_history.get("remaining_useful_life", 500)

        if last_service > 2000:
            actions.append({
                "type": "preventive",
                "urgency": "medium",
                "description": f"Device has run {int(last_service)} hours since last service — schedule preventive maintenance.",
            })

        if failure_count > 3:
            actions.append({
                "type": "corrective",
                "urgency": "high",
                "description": f"Device has {failure_count} recorded failures — root cause analysis recommended.",
            })

        if rul < 200:
            actions.append({
                "type": "replacement",
                "urgency": "critical",
                "description": f"Remaining useful life is ~{int(rul)} hours — plan for replacement.",
            })

        if uptime > 8760:
            actions.append({
                "type": "inspection",
                "urgency": "medium",
                "description": "Device has been running for over a year — full inspection recommended.",
            })

        if not actions:
            actions.append({
                "type": "routine",
                "urgency": "low",
                "description": "No maintenance actions required at this time.",
            })

        return actions

    # ------------------------------------------------------------------
    # Energy optimisation
    # ------------------------------------------------------------------

    def get_energy_optimization_recommendations(
        self,
        readings: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Analyse recent readings and return energy optimisation tips."""
        tips: List[Dict[str, Any]] = []

        if not readings:
            return [{"tip": "Insufficient data for energy analysis.", "potential_savings": "N/A"}]

        avg_energy = sum(float(r.get("energy_consumption", 0)) for r in readings) / len(readings)
        avg_temp = sum(float(r.get("temperature", 22)) for r in readings) / len(readings)
        avg_occupancy = sum(float(r.get("occupancy", 1)) for r in readings) / len(readings)

        if avg_energy > 100:
            tips.append({
                "tip": "Energy consumption is above average. Audit high-draw equipment and consider load scheduling.",
                "potential_savings": "10-20% reduction possible.",
            })

        if avg_temp < 20 or avg_temp > 26:
            tips.append({
                "tip": "Temperature setpoints may be suboptimal. Adjust based on occupancy patterns.",
                "potential_savings": "5-15% HVAC energy reduction.",
            })

        if avg_occupancy < 0.3:
            tips.append({
                "tip": "Low occupancy detected. Implement occupancy-based lighting and HVAC control.",
                "potential_savings": "Up to 25% energy reduction in low-traffic periods.",
            })

        if len(readings) >= 2:
            energy_values = [float(r.get("energy_consumption", 0)) for r in readings]
            peak = max(energy_values)
            trough = min(energy_values)
            if peak > 2 * trough and trough > 0:
                tips.append({
                    "tip": "Large peak-to-trough ratio detected. Consider load shifting to off-peak hours.",
                    "potential_savings": "10-30% cost reduction via demand response.",
                })

        if not tips:
            tips.append({
                "tip": "Energy usage is within optimal range. Continue monitoring.",
                "potential_savings": "N/A",
            })

        return tips
