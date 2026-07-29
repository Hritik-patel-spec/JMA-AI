import os
from datetime import datetime
import pandas as pd
from app.config import settings

def log_login_to_excel(student_id: str, student_name: str, login_type: str):
    new_data = {
        "Timestamp": [datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        "Student ID": [student_id],
        "Student Name": [student_name],
        "Login Method": [login_type]
    }
    df = pd.DataFrame(new_data)
    file_path = settings.EXCEL_FILE_PATH

    if os.path.exists(file_path):
        with pd.ExcelWriter(file_path, mode='a', engine='openpyxl', if_sheet_exists='overlay') as writer:
            start_row = writer.sheets['Logins'].max_row if 'Logins' in writer.sheets else 0
            df.to_excel(writer, sheet_name='Logins', index=False, header=(start_row == 0), startrow=start_row)
    else:
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Logins', index=False)