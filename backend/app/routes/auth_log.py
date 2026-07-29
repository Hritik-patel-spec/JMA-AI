from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.excel_logger import log_login_to_excel

router = APIRouter()

class LoginSchema(BaseModel):
    student_id: str
    student_name: str
    login_type: str  # Google, Phone, Password

@router.post("/log-login")
def log_login(data: LoginSchema):
    try:
        log_login_to_excel(data.student_id, data.student_name, data.login_type)
        return {"status": "success", "message": "Login detail saved to Excel"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))