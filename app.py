import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from fpdf import FPDF
from openai import OpenAI

app = FastAPI()

# CORS settings for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API Keys from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

EXCEL_FILE = "student_activity_log.xlsx"

# System Prompt for Sylvia Persona
SYLVIA_SYSTEM_PROMPT = """
You are Sylvia, an empathetic, encouraging, and highly knowledgeable AI Teacher at Jesus and Mary. 
Your goal is to guide students, answer their academic and school-related questions clearly, 
and explain complex concepts in a friendly, easy-to-understand tone.
"""

# --- Helper Functions for Excel Logging & PDF Generation ---

def log_login_event(student_id: str, student_name: str, login_method: str):
    """Logs student login details into an Excel sheet."""
    log_data = {
        "Timestamp": [datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        "Student ID": [student_id],
        "Student Name": [student_name],
        "Login Method": [login_method]
    }
    df = pd.DataFrame(log_data)
    
    if os.path.exists(EXCEL_FILE):
        with pd.ExcelWriter(EXCEL_FILE, mode='a', engine='openpyxl', if_sheet_exists='overlay') as writer:
            start_row = writer.sheets['Logins'].max_row if 'Logins' in writer.sheets else 0
            df.to_excel(writer, sheet_name='Logins', index=False, header=(start_row == 0), startrow=start_row)
    else:
        with pd.ExcelWriter(EXCEL_FILE, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Logins', index=False)

def export_student_history_pdf(student_id: str, student_name: str, chat_history: list):
    """Generates a downloadable PDF report for a student's chat session."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, f"Jesus and Mary - AI Teacher Sylvia Session Report", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"Student Name: {student_name} | ID: {student_id}", ln=True, align='L')
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align='L')
    pdf.ln(5)
    
    pdf.set_font("Arial", size=11)
    for chat in chat_history:
        role = "Student" if chat['role'] == 'user' else "Sylvia (Teacher)"
        pdf.set_font("Arial", 'B', 11)
        pdf.multi_cell(0, 8, f"{role}:")
        pdf.set_font("Arial", size=11)
        pdf.multi_cell(0, 8, chat['content'])
        pdf.ln(2)

    output_filename = f"reports/{student_id}_history_{int(datetime.now().timestamp())}.pdf"
    os.makedirs("reports", exist_ok=True)
    pdf.output(output_filename)
    return output_filename

# --- API Endpoints ---

class LoginRequest(BaseModel):
    student_id: str
    student_name: str
    method: str  # 'Google', 'Phone', 'Password'

class ChatRequest(BaseModel):
    student_id: str
    message: str
    history: list = []

@app.post("/api/login")
def handle_login(req: LoginRequest):
    log_login_event(req.student_id, req.student_name, req.method)
    return {"status": "success", "message": "Login logged successfully"}

@app.post("/api/chat")
def chat_with_sylvia(req: ChatRequest):
    messages = [{"role": "system", "content": SYLVIA_SYSTEM_PROMPT}] + req.history + [{"role": "user", "content": req.message}]
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    
    reply = response.choices[0].message.content
    return {"response": reply}