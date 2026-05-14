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
        prompt = f"""You are a manufacturing materials expert.
Design Type: {design_type}
Dimensions: {geo_features.get('dimensions')} mm
Volume: {geo_features.get('volume'):.2f} mm³
Surface Area: {geo_features.get('surface_area'):.2f} mm²

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

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            data = json.loads(response.text)
            materials = data.get("materials", [])
            
            # Store in DB
            for mat in materials:
                supabase.table("material_requirements").insert({
                    "cad_file_id": cad_file_id,
                    "material_name": mat.get("material_name"),
                    "material_category": mat.get("material_category"),
                    "estimated_quantity": mat.get("estimated_quantity"),
                    "unit": mat.get("unit"),
                    "priority": mat.get("priority"),
                    "supplier_type": mat.get("supplier_type"),
                    "inference_confidence": mat.get("inference_confidence", 0.0)
                }).execute()
                
            return materials
        except Exception as e:
            logger.error(f"Material inference failed: {e}")
            return []

    def populate_knowledge_base(self):
        """
        Utility to seed the design_material_mappings table with common defaults.
        """
        defaults = [
            {"design_type": "sofa", "material_name": "Timber", "range": "20-50 kg", "use": "Frame"},
            {"design_type": "sofa", "material_name": "Foam", "range": "5-15 kg", "use": "Padding"},
            {"design_type": "gear", "material_name": "Steel", "range": "0.1-5 kg", "use": "Body"},
            {"design_type": "bracket", "material_name": "Aluminum", "range": "0.05-2 kg", "use": "Structure"},
        ]
        try:
            for item in defaults:
                supabase.table("design_material_mappings").upsert({
                    "design_type": item["design_type"],
                    "material_name": item["material_name"],
                    "typical_quantity_range": item["range"],
                    "use_case": item["use"]
                }, on_conflict="design_type,material_name").execute()
        except Exception as e:
            logger.error(f"Failed to populate knowledge base: {e}")
