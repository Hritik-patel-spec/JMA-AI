import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from typing import List, Optional

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq Client Initialization
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print("DEBUG: Groq Key Loaded ->", "YES" if GROQ_API_KEY else "NO")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

CHAT_EXCEL_FILE = "chat_history.xlsx"

class MessageModel(BaseModel):
    sender: str  # 'user' or 'ai'
    message: str

class ChatSessionModel(BaseModel):
    userKey: str
    sessionId: Optional[str] = "default"
    type: Optional[str] = "chat"
    messages: List[MessageModel]

def get_chat_df():
    if os.path.exists(CHAT_EXCEL_FILE):
        try:
            return pd.read_excel(CHAT_EXCEL_FILE, dtype=str)
        except Exception as e:
            print("Error reading Excel, creating new:", e)
    
    df = pd.DataFrame(columns=["UserKey", "SessionId", "Type", "Sender", "Message"])
    try:
        df.to_excel(CHAT_EXCEL_FILE, index=False)
    except Exception as e:
        print("Excel Create Warning:", e)
    return df

def safe_save_to_excel(df):
    try:
        df.to_excel(CHAT_EXCEL_FILE, index=False)
    except PermissionError:
        print("⚠️ Excel file open hai MS Excel me! Isko close karein tabhi history save hogi.")
    except Exception as e:
        print("Excel Write Error:", e)

# 1. FETCH CHAT HISTORY FOR USER
@app.get("/api/chat/history")
@app.get("/api/chat/history/")
async def get_chat_history(userKey: str):
    df = get_chat_df()
    if df.empty:
        return {"sessions": [], "history": []}
    
    user_chats = df[df["UserKey"] == str(userKey)]
    
    # Group by SessionId to return proper session objects matching frontend expectations
    sessions_map = {}
    for _, row in user_chats.iterrows():
        s_id = str(row.get("SessionId", "default"))
        s_type = str(row.get("Type", "chat"))
        
        if s_id not in sessions_map:
            sessions_map[s_id] = {
                "sessionId": s_id,
                "title": row["Message"][:30] + "...",  # First message snippet as title
                "type": s_type,
                "messages": []
            }
        sessions_map[s_id]["messages"].append({
            "sender": str(row["Sender"]),
            "message": str(row["Message"])
        })
        
    sessions_list = list(sessions_map.values())
    return {"sessions": sessions_list, "history": sessions_list}

# 2. SAVE USER MESSAGE & GENERATE GROQ AI REPLY
@app.post("/api/chat/save-session")
@app.post("/api/chat/save-session/")
@app.post("/api/chat/save")
@app.post("/api/chat/save/")
async def save_chat_session(data: ChatSessionModel):
    df = get_chat_df()
    
    # Get the latest message sent by the user
    if not data.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
        
    latest_msg = data.messages[-1]
    
    # Save User message to Excel
    user_entry = {
        "UserKey": str(data.userKey),
        "SessionId": str(data.sessionId),
        "Type": str(data.type),
        "Sender": latest_msg.sender,
        "Message": latest_msg.message
    }
    df = pd.concat([df, pd.DataFrame([user_entry])], ignore_index=True)
    
    ai_reply = ""

    if latest_msg.sender == "user":
        if not client:
            ai_reply = "API Key setup nahi hai! `.env` me GROQ_API_KEY check karein."
        else:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are Sylvia AI, an intelligent educational assistant for Jesus and Mary Academy students. Answer concisely and clearly."
                        },
                        {
                            "role": "user",
                            "content": latest_msg.message
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                )
                ai_reply = chat_completion.choices[0].message.content
            except Exception as err:
                print("Groq Error:", err)
                ai_reply = f"Groq Error: {str(err)}"

        # Save AI reply to Excel as well
        ai_entry = {
            "UserKey": str(data.userKey),
            "SessionId": str(data.sessionId),
            "Type": str(data.type),
            "Sender": "ai",
            "Message": ai_reply
        }
        df = pd.concat([df, pd.DataFrame([ai_entry])], ignore_index=True)

    safe_save_to_excel(df)

    return {
        "status": "success",
        "reply": ai_reply,
        "message": ai_reply
    }