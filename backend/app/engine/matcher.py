import json
from typing import List, Dict, Any
from pydantic import BaseModel

class MatchResult(BaseModel):
    machine_id: str
    type: str
    match_score: float
    rank: int
    estimated_hourly_cost: float
    precision_mm: float
    defect_rate: float

class MatchingEngine:
    def __init__(self, data_path: str = "data/machine_rates.json"):
        self.data_path = data_path
        self.machines = self._load_machines()

    def _load_machines(self) -> List[Dict[str, Any]]:
        try:
            with open(self.data_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading machine data: {e}")
            return []

    def find_matches(self, fabric_type: str, req_tolerance: float, limit: int = 5) -> List[MatchResult]:
        """
        Production-grade matching logic:
        1. Filter by material compatibility.
        2. Filter by precision (exclude machines that can't meet tolerance).
        3. Rank by weighted score (Efficiency + Quality + Cost).
        """
        eligible = []
        for m in self.machines:
            # 1. Compatibility Check
            if fabric_type.lower() not in [mat.lower() for mat in m["material_compat"]]:
                continue
            
            # 2. Precision Threshold (Hard filter for production level)
            if m["precision_mm"] > (req_tolerance * 1.5): # Allowance for slight variance, but not much
                continue
                
            # 3. Composite Scoring (The Matching Algorithm)
            # Weights: Cost (40%), Quality (40%), Precision Margin (20%)
            
            # Cost Score (Lower is better, inverted for ranking)
            # Normalizing against max/min rates in our data ($12-$45)
            cost_score = (45 - m["total_hourly_rate"]) / (45 - 12)
            
            # Quality Score (Lower defect rate is better)
            # Normalizing against max/min defects (0.5% - 5%)
            quality_score = (0.05 - m["defect_rate_base"]) / (0.05 - 0.005)
            
            # Precision Score (Closer to required tolerance is better)
            precision_score = 1.0 - (m["precision_mm"] / (req_tolerance * 2.0))
            
            total_score = (cost_score * 0.4) + (quality_score * 0.4) + (precision_score * 0.2)
            
            eligible.append({
                "machine_id": m["machine_id"],
                "type": m["type"],
                "match_score": round(total_score * 100, 2),
                "estimated_hourly_cost": m["total_hourly_rate"],
                "precision_mm": m["precision_mm"],
                "defect_rate": m["defect_rate_base"]
            })
            
        # Sort by match score descending
        sorted_matches = sorted(eligible, key=lambda x: x["match_score"], reverse=True)
        
        results = []
        for i, m in enumerate(sorted_matches[:limit]):
            results.append(MatchResult(rank=i+1, **m))
            
        return results

# Production Instance
matcher = MatchingEngine()
