from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.connection import get_db
from src.exports.excel_export import ExcelExportService

router = APIRouter(tags=["Export"])

VALID_MODULE_TYPES = ("cold_storage", "machine_health", "water_quality", "warehouse")


@router.get("/api/export/excel")
async def export_excel(
    type: str = Query(..., description="Export type: sensors, alerts, analytics, reports, devices"),
    module_type: Optional[str] = Query(None),
    device_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    report_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = ExcelExportService(db)

    if type == "sensors":
        output = await service.export_sensor_data(device_id, start_date, end_date, module_type)
        filename = f"sensor_data_{module_type or 'all'}_{device_id or 'all'}.xlsx"
    elif type == "alerts":
        output = await service.export_alerts(device_id, severity, module_type)
        filename = f"alerts_{module_type or 'all'}_{severity or 'all'}.xlsx"
    elif type == "analytics":
        output = await service.export_analytics(device_id, start_date, end_date, module_type)
        filename = f"analytics_{module_type or 'all'}_{device_id or 'all'}.xlsx"
    elif type == "reports":
        output = await service.export_reports(report_type, module_type)
        filename = f"reports_{report_type or 'all'}_{module_type or 'all'}.xlsx"
    elif type == "devices":
        output = await service.export_device_logs(device_id, module_type)
        filename = f"devices_{module_type or 'all'}_{device_id or 'all'}.xlsx"
    else:
        return {"error": f"Unknown export type: {type}. Valid types: sensors, alerts, analytics, reports, devices"}

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
