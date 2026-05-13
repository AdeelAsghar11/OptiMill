from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.supabase import supabase
from app.auth.utils import get_current_user
from app.core.config import settings
from openai import OpenAI
import json

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/upload")
async def upload_and_analyze_cad(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    """
    1. Upload CAD file to Supabase Storage
    2. Analyze metadata with OpenAI GPT-4o
    3. Store result in 'cad_files' table
    """
    try:
        # 1. Upload to Supabase Storage
        file_content = await file.read()
        file_path = f"{current_user['id']}/{file.filename}"
        
        # Note: Ensure 'cad-files' bucket exists in Supabase Dashboard
        storage_res = supabase.storage.from_("cad-files").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )

        file_url = supabase.storage.from_("cad-files").get_public_url(file_path)

        # 2. AI Analysis via GPT-4o
        prompt = f"""
        You are a manufacturing expert and cost estimator.
        Analyze this CAD file metadata:
        Filename: {file.filename}
        Type: {file.content_type}
        Size: {len(file_content)} bytes

        Respond ONLY in JSON format:
        {{
          "feasibility_score": 0-100,
          "complexity": "simple|moderate|complex",
          "recommended_process": "CNC|3D_FDM|3D_SLA|laser_cut|injection_mold",
          "materials": ["aluminum", "pla", "steel"],
          "estimated_cost_usd": {{ "low": 50, "mid": 150, "high": 300 }},
          "estimated_hours": 5,
          "notes": "Estimated based on file metadata.",
          "warnings": []
        }}
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )

        analysis_result = json.loads(response.choices[0].message.content)

        # 3. Store in 'cad_files' table
        db_res = supabase.table("cad_files").insert({
            "client_id": current_user["id"],
            "file_name": file.filename,
            "file_url": file_url,
            "file_size": len(file_content),
            "file_type": file.content_type,
            "analysis": analysis_result,
            "feasibility_score": analysis_result.get("feasibility_score"),
            "estimated_cost_low": analysis_result.get("estimated_cost_usd", {}).get("low"),
            "estimated_cost_high": analysis_result.get("estimated_cost_usd", {}).get("high"),
            "process_recommendation": analysis_result.get("recommended_process"),
            "status": "analyzed"
        }).execute()

        return db_res.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}")
async def get_cad_analysis(file_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("cad_files").select("*").eq("id", file_id).eq("client_id", current_user["id"]).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
