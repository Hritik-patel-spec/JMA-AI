import os
from datetime import datetime
from fpdf import FPDF
from app.config import settings

def generate_student_pdf(student_id: str, student_name: str, chat_history: list) -> str:
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Jesus and Mary Educational Institution", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "I", 12)
    pdf.cell(0, 8, "Sylvia AI Teacher - Student Interaction Report", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)

    # Student Details
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, f"Student Name: {student_name}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Student ID: {student_id}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Date: {datetime.now().strftime('%d %B %Y, %I:%M %p')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    # Chat Messages
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    for msg in chat_history:
        role = "Student" if msg.role == "user" else "Sylvia (AI Teacher)"
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(0, 6, f"{role}:", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, msg.content)
        pdf.ln(3)

    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    file_path = os.path.join(settings.REPORTS_DIR, f"{student_id}_history.pdf")
    pdf.output(file_path)
    return file_path