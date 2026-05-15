from app.supabase import supabase
import json

def check_db():
    try:
        shops = supabase.table("shops").select("*").execute()
        print(f"Shops: {len(shops.data)}")
        if shops.data:
            print(json.dumps(shops.data[:2], indent=2))
        
        cad_files = supabase.table("cad_files").select("*").execute()
        print(f"CAD Files: {len(cad_files.data)}")
        
        materials = supabase.table("material_requirements").select("*").execute()
        print(f"Material Requirements: {len(materials.data)}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
