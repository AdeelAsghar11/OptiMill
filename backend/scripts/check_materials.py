import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))
load_dotenv(os.path.join(os.getcwd(), "backend", ".env"))

from app.supabase import supabase

def check():
    print("Checking last 5 material requirements...")
    res = supabase.table("material_requirements").select("*").order("created_at", desc=True).limit(5).execute()
    if res.data:
        for row in res.data:
            print(f"File ID: {row['cad_file_id']} | Material: {row['material_name']} | Conf: {row['inference_confidence']}")
    else:
        print("No material requirements found.")

if __name__ == "__main__":
    check()
