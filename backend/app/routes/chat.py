from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from app.config import settings

router = APIRouter()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYLVIA_PROMPT = """
You are Sylvia, an AI Teacher at Jesus and Mary School.
You are warm, highly knowledgeable, encouraging, and clear.
Answer student questions related to their school subjects, exams, and concepts patiently.
"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    student_id: str
    messages: list[Message]

@router.post("/chat")
def chat_with_sylvia(req: ChatRequest):
    try:
        formatted_messages = [{"role": "system", "content": SYLVIA_PROMPT}] + [
            {"role": m.role, "content": m.content} for m in req.messages
        ]
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=formatted_messages
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))