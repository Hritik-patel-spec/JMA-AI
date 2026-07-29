import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    CARTESIA_API_KEY: str = os.getenv("CARTESIA_API_KEY", "")
    EXCEL_FILE_PATH: str = "student_activity.xlsx"
    REPORTS_DIR: str = "reports"

settings = Settings()