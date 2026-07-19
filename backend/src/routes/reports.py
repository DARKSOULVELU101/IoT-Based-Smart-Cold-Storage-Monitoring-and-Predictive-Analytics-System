from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import User
from src.schemas import ReportResponse, ReportListResponse, ReportGenerate
from src.services.report_service import generate_report, list_reports, get_report
from src.middleware.auth import get_current_user, require_role

router = APIRouter(tags=["Reports"])


@router.get("/api/reports", response_model=ReportListResponse)
async def list_all_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports, total = await list_reports(db, skip=skip, limit=limit)
    return ReportListResponse(reports=reports, total=total)


@router.post("/api/reports/generate", response_model=ReportResponse)
async def generate_report_endpoint(
    data: ReportGenerate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    report = await generate_report(db, report_type=data.report_type, device_id=data.device_id, zone=data.zone)
    return report


@router.get("/api/reports/{report_id}", response_model=ReportResponse)
async def get_report_endpoint(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/api/reports/{report_id}/download")
async def download_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    import io
    import json
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = report.title

    ws.append(["Report Type", report.report_type])
    ws.append(["Title", report.title])
    ws.append(["Zone", report.zone or "All"])
    ws.append(["Generated At", report.created_at.strftime("%Y-%m-%d %H:%M:%S")])
    ws.append([])

    if report.content:
        ws.append(["Report Data"])
        for key, value in report.content.items():
            ws.append([key, str(value)])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={report.report_type}_report.xlsx"},
    )
