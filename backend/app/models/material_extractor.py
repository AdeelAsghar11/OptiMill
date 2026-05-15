import json
import logging
from typing import List, Dict, Any
from app.supabase import supabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class MaterialExtractor:
    """
    Infers material requirements based on design classification and geometry.
    """

    async def infer_materials(self, cad_file_id: str, design_type: str, geo_features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Uses Gemini to infer specific material requirements and stores them.
        """
        dimensions = geo_features.get('dimensions', 'Unknown')
        volume = geo_features.get('volume', 0.0)
        surface_area = geo_features.get('surface_area', 0.0)

        prompt = f"""You are a manufacturing materials expert.
Design Type: {design_type}
Dimensions: {dimensions} mm
Volume: {volume:.2f} mm³
Surface Area: {surface_area:.2f} mm²

Based on this design, list the typical materials required for production.
Respond ONLY in JSON format:
{{
  "materials": [
    {{
      "material_name": "string",
      "material_category": "structural|aesthetic|fastening|padding",
      "estimated_quantity": 0.0,
      "unit": "kg|meters|sq-ft|liters",
      "priority": "primary|secondary|optional",
      "supplier_type": "string",
      "inference_confidence": 0.0-1.0
    }}
  ]
}}"""

        materials = []
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash-latest")
            
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            data = json.loads(response.text)
            materials = data.get("materials", [])
            logger.info(f"AI inferred {len(materials)} materials for {design_type}")
            
        except Exception as e:
            logger.error(f"AI Material inference (Gemini) failed: {e}")
            
            # Fallback to Groq
            if settings.GROQ_API_KEY:
                try:
                    logger.info("Falling back to Groq for material inference...")
                    from openai import OpenAI
                    client = OpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
                    response = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[{"role": "user", "content": prompt}],
                        response_format={"type": "json_object"},
                    )
                    data = json.loads(response.choices[0].message.content)
                    materials = data.get("materials", [])
                    logger.info(f"Groq inferred {len(materials)} materials for {design_type}")
                except Exception as groq_err:
                    logger.error(f"AI Material inference (Groq) failed: {groq_err}")

        # Fallback to knowledge base if AI failed or returned nothing
        if not materials:
            try:
                logger.info(f"Falling back to knowledge base for {design_type}")
                kb_res = supabase.table("design_material_mappings").select("*").eq("design_type", design_type.lower()).execute()
                for item in kb_res.data:
                    materials.append({
                        "material_name": item.get("material_name"),
                        "material_category": "structural", # Default
                        "estimated_quantity": 1.0, # Placeholder
                        "unit": "unit",
                        "priority": "primary",
                        "supplier_type": "Standard",
                        "inference_confidence": 0.5
                    })
            except Exception as kb_err:
                logger.error(f"Knowledge base lookup failed: {kb_err}")

        # Persist materials to database
        final_materials = []
        if materials:
            try:
                # Check if materials already exist for this CAD file to avoid duplicates
                existing = supabase.table("material_requirements").select("id").eq("cad_file_id", cad_file_id).execute()
                if not existing.data:
                    for mat in materials:
                        mat_record = {
                            "cad_file_id": cad_file_id,
                            "material_name": mat.get("material_name"),
                            "material_category": mat.get("material_category", "structural"),
                            "estimated_quantity": mat.get("estimated_quantity", 1.0),
                            "unit": mat.get("unit", "unit"),
                            "priority": mat.get("priority", "primary"),
                            "supplier_type": mat.get("supplier_type", "Standard"),
                            "inference_confidence": mat.get("inference_confidence", 0.5)
                        }
                        supabase.table("material_requirements").insert(mat_record).execute()
                        final_materials.append(mat_record)
                else:
                    logger.info(f"Materials already exist for CAD file {cad_file_id}, skipping insertion.")
                    # Return existing ones
                    final_res = supabase.table("material_requirements").select("*").eq("cad_file_id", cad_file_id).execute()
                    final_materials = final_res.data
            except Exception as db_err:
                logger.error(f"Failed to persist materials: {db_err}")
        
        return final_materials

    def populate_knowledge_base(self):
        """
        Utility to seed the design_material_mappings table with common defaults.
        """
        defaults = [
            {"design_type": "sofa", "material_name": "Timber", "range": "20-50 kg", "use": "Frame"},
            {"design_type": "sofa", "material_name": "Foam", "range": "5-15 kg", "use": "Padding"},
            {"design_type": "gear", "material_name": "Steel", "range": "0.1-5 kg", "use": "Body"},
            {"design_type": "bracket", "material_name": "Aluminum", "range": "0.05-2 kg", "use": "Structure"},
            {"design_type": "enclosure", "material_name": "ABS Plastic", "range": "0.1-1 kg", "use": "Body"},
            {"design_type": "enclosure", "material_name": "Screws", "range": "4-10 units", "use": "Fastening"},
            {"design_type": "table", "material_name": "Oak Wood", "range": "10-40 kg", "use": "Top"},
            {"design_type": "decorative", "material_name": "PLA Plastic", "range": "0.05-0.5 kg", "use": "Body"},
            {"design_type": "structural", "material_name": "Steel S235", "range": "5-100 kg", "use": "Frame"},
        ]
        try:
            for item in defaults:
                supabase.table("design_material_mappings").upsert({
                    "design_type": item["design_type"].lower(),
                    "material_name": item["material_name"],
                    "typical_quantity_range": item["range"],
                    "use_case": item["use"]
                }, on_conflict="design_type,material_name").execute()
        except Exception as e:
            logger.error(f"Failed to populate knowledge base: {e}")
