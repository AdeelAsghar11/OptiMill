import logging
from typing import List, Dict, Any
from app.supabase import supabase

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Ranks shops based on CAD analysis and shop capabilities.
    """

    async def get_top_recommendations(self, cad_file_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Calculates scores for all shops and returns the top ranked ones.
        """
        try:
            # 1. Get CAD file analysis and inferred materials
            cad_res = supabase.table("cad_files").select("*").eq("id", cad_file_id).single().execute()
            cad_file = cad_res.data
            
            materials_res = supabase.table("material_requirements").select("material_name").eq("cad_file_id", cad_file_id).execute()
            required_materials = [m["material_name"].lower() for m in materials_res.data]
            
            recommended_process = cad_file.get("process_recommendation")
            
            # 2. Get all shops
            shops_res = supabase.table("shops").select("*").execute()
            shops = shops_res.data
            
            scored_shops = []
            for shop in shops:
                score = self._calculate_score(shop, recommended_process, required_materials)
                
                # Store score in DB for future tracking/audit
                try:
                    supabase.table("recommendation_scores").upsert({
                        "cad_file_id": cad_file_id,
                        "shop_id": shop["id"],
                        "total_score": score["total"],
                        "match_details": score["details"]
                    }, on_conflict="cad_file_id,shop_id").execute()
                except Exception as e:
                    logger.warning(f"Failed to store recommendation score: {e}")
                
                scored_shops.append({
                    **shop,
                    "match_score": score["total"],
                    "match_details": score["details"]
                })
            
            # 3. Rank and return
            ranked = sorted(scored_shops, key=lambda x: x["match_score"], reverse=True)
            return ranked[:limit]

        except Exception as e:
            logger.error(f"Recommendation calculation failed: {e}")
            return []

    def _calculate_score(self, shop: Dict[str, Any], process: str, materials: List[str]) -> Dict[str, Any]:
        """
        Scoring formula:
        Capability Match (0.4) + Material Availability (0.3) + Rating (0.2) + Proximity (0.1)
        """
        # A. Capability Match (0.4)
        cap_score = 0.0
        shop_caps = [c.lower() for c in (shop.get("capabilities") or [])]
        if process and process.lower() in shop_caps:
            cap_score = 1.0
        elif any(cap in (process or "").lower() for cap in shop_caps):
            cap_score = 0.5 # Partial match
            
        # B. Material Availability (0.3)
        mat_score = 0.0
        shop_mats = [m.lower() for m in (shop.get("materials") or [])]
        if materials:
            matches = sum(1 for m in materials if m.lower() in shop_mats)
            mat_score = matches / len(materials)
        else:
            mat_score = 0.5 # Default if no materials specified
            
        # C. Rating (0.2)
        rating_score = (shop.get("rating") or 0.0) / 5.0
        
        # D. Proximity (0.1) - Placeholder for Phase 10
        prox_score = 0.5 # Middle ground for now
        
        total = (cap_score * 0.4) + (mat_score * 0.3) + (rating_score * 0.2) + (prox_score * 0.1)
        
        return {
            "total": round(total, 4),
            "details": {
                "capability_match": cap_score,
                "material_match": mat_score,
                "rating_factor": rating_score,
                "proximity_factor": prox_score
            }
        }
