import io
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter


HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
HEADER_FILL = PatternFill(start_color="2B5797", end_color="2B5797", fill_type="solid")
HEADER_ALIGNMENT = Alignment(horizontal="center", vertical="center", wrap_text=True)
THIN_BORDER = Border(
    left=Side(style="thin"),
    right=Side(style="thin"),
    top=Side(style="thin"),
    bottom=Side(style="thin"),
)

CRITICAL_FILL = PatternFill(start_color="FF6B6B", end_color="FF6B6B", fill_type="solid")
WARNING_FILL = PatternFill(start_color="FFD93D", end_color="FFD93D", fill_type="solid")
SAFE_FILL = PatternFill(start_color="6BCB77", end_color="6BCB77", fill_type="solid")


def _apply_header_style(ws, row=1, col_count=1):
    for col in range(1, col_count + 1):
        cell = ws.cell(row=row, column=col)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = HEADER_ALIGNMENT
        cell.border = THIN_BORDER


def _auto_column_widths(ws):
    for col in ws.columns:
        max_length = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        ws.column_dimensions[col_letter].width = min(max_length + 4, 40)


def export_sensor_data(readings: list) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Sensor Data"

    headers = [
        "Reading ID", "Device ID", "Zone", "Temperature (°C)", "Humidity (%)",
        "Door Open", "Door Open (s)", "Power", "Gas Level (ppm)",
        "Compressor Current (A)", "Compressor On", "Risk Score", "Status", "Timestamp",
    ]
    ws.append(headers)
    _apply_header_style(ws, row=1, col_count=len(headers))

    for r in readings:
        row = [
            str(r.id), str(r.device_id), r.zone, r.temperature, r.humidity,
            "Yes" if r.door_open else "No", r.door_open_seconds,
            "Available" if r.power_available else "Unavailable",
            r.gas_level, round(r.compressor_current, 2),
            "On" if r.compressor_on else "Off", r.risk_score, r.status,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
        ]
        ws.append(row)

        risk_cell = ws.cell(row=ws.max_row, column=12)
        if r.risk_score > 60:
            risk_cell.fill = CRITICAL_FILL
        elif r.risk_score > 30:
            risk_cell.fill = WARNING_FILL
        else:
            risk_cell.fill = SAFE_FILL

    _auto_column_widths(ws)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def export_alerts(alerts: list) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Alerts"

    headers = ["Alert ID", "Device ID", "Zone", "Alert Type", "Level", "Message", "Resolved", "Resolved At", "Created At"]
    ws.append(headers)
    _apply_header_style(ws, row=1, col_count=len(headers))

    for a in alerts:
        row = [
            str(a.id), str(a.device_id), a.zone, a.alert_type,
            a.level.value if hasattr(a.level, "value") else a.level,
            a.message, "Yes" if a.resolved else "No",
            a.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if a.resolved_at else "N/A",
            a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else "",
        ]
        ws.append(row)

        level_cell = ws.cell(row=ws.max_row, column=5)
        level_val = a.level.value if hasattr(a.level, "value") else a.level
        if level_val == "critical":
            level_cell.fill = CRITICAL_FILL
        elif level_val == "warning":
            level_cell.fill = WARNING_FILL

    _auto_column_widths(ws)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def export_analytics(analytics_list: list) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Analytics"

    headers = [
        "ID", "Device ID", "Zone", "Period", "Temp Avg", "Temp Min", "Temp Max",
        "Humidity Avg", "Door Open Count", "Door Open Duration (s)", "Compressor Runtime (%)",
        "Power Failures", "Risk Score Avg", "Energy Consumption (kWh)", "Created At",
    ]
    ws.append(headers)
    _apply_header_style(ws, row=1, col_count=len(headers))

    for a in analytics_list:
        row = [
            str(a.id), str(a.device_id), a.zone,
            a.period_type.value if hasattr(a.period_type, "value") else a.period_type,
            a.temperature_avg, a.temperature_min, a.temperature_max, a.humidity_avg,
            a.door_open_count, a.door_open_duration, a.compressor_runtime,
            a.power_failure_count, a.risk_score_avg, a.energy_consumption,
            a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else "",
        ]
        ws.append(row)

    _auto_column_widths(ws)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def export_reports(reports: list) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Reports"

    headers = ["Report ID", "Device ID", "Zone", "Report Type", "Title", "Content Summary", "Created At"]
    ws.append(headers)
    _apply_header_style(ws, row=1, col_count=len(headers))

    for r in reports:
        content_summary = str(r.content)[:200] + "..." if r.content and len(str(r.content)) > 200 else str(r.content) if r.content else "N/A"
        row = [
            str(r.id), str(r.device_id) if r.device_id else "N/A",
            r.zone if r.zone else "All Zones", r.report_type, r.title,
            content_summary,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
        ]
        ws.append(row)

    _auto_column_widths(ws)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
