from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.routes.chat import Message
from app.utils.pdf_builder import generate_student_pdf

router = APIRouter()

class PDFRequest(BaseModel):
    student_id: str
    student_name: str
    chat_history: list[Message]

@router.post("/export-pdf")
def export_pdf(data: PDFRequest):
    try:
        file_path = generate_student_pdf(data.student_id, data.student_name, data.chat_history)
        return FileResponse(file_path, filename=f"{data.student_id}_chat.pdf", media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))