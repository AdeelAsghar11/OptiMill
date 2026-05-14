from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.supabase import supabase
from app.auth.utils import get_current_user
from app.core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Prompt shared between providers ────────────────────────────────────────────
def _build_prompt(filename: str, content_type: str, size: int) -> str:
    return f"""You are a manufacturing expert and cost estimator.
Analyze this CAD file metadata:
Filename: {filename}
Type: {content_type}
Size: {size} bytes

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
}}"""


def _analyze_with_gemini(prompt: str) -> dict:
    """Primary: Google Gemini 1.5 Flash (free tier friendly)."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={"response_mime_type": "application/json"},
    )
    response = model.generate_content(prompt)
    return json.loads(response.text)


def _analyze_with_groq(prompt: str) -> dict:
    """Fallback: Groq (LPU Inference)."""
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


def _analyze_cad_metadata(filename: str, content_type: str, size: int) -> dict:
    """Try Gemini first; fall back to Groq if Gemini is unavailable or errors."""
    prompt = _build_prompt(filename, content_type, size)

    if settings.GEMINI_API_KEY:
        try:
            logger.info("Analyzing CAD metadata with Gemini…")
            return _analyze_with_gemini(prompt)
        except Exception as e:
            logger.warning(f"Gemini analysis failed ({e}); falling back to Groq.")

    if settings.GROQ_API_KEY:
        logger.info("Analyzing CAD metadata with Groq…")
        return _analyze_with_groq(prompt)

    raise RuntimeError(
        "No AI provider available. Set GEMINI_API_KEY or GROQ_API_KEY in .env."
    )


# ── Routes ──────────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_and_analyze_cad(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    1. Upload CAD file to Supabase Storage
    2. Analyze metadata with Gemini (fallback: Grok)
    3. Store result in 'cad_files' table
    """
    try:
        # 1. Upload to Supabase Storage
        file_content = await file.read()
        file_path = f"{current_user['id']}/{file.filename}"

        # Note: Ensure 'cad-files' bucket exists in Supabase Dashboard
        supabase.storage.from_("cad-files").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
        file_url = supabase.storage.from_("cad-files").get_public_url(file_path)

        # 2. AI Analysis (Gemini → Groq fallback)
        analysis_result = _analyze_cad_metadata(
            filename=file.filename,
            content_type=file.content_type,
            size=len(file_content),
        )

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
            "status": "analyzed",
        }).execute()

        return db_res.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{file_id}")
async def get_cad_analysis(file_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = (
            supabase.table("cad_files")
            .select("*")
            .eq("id", file_id)
            .eq("client_id", current_user["id"])
            .single()
            .execute()
        )
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
