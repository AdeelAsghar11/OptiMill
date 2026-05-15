from app.supabase import supabase
import sys

try:
    res = supabase.table("external_suppliers").select("*").limit(1).execute()
    print("Table 'external_suppliers' exists.")
except Exception as e:
    print(f"Table check failed: {e}")
    # Try to create it via RPC or just report it
    print("Please ensure the table is created in the Supabase SQL editor.")
