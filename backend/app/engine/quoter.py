from pydantic import BaseModel
from typing import List, Dict

class QuoteBreakdown(BaseModel):
    base_manufacturing_cost: float
    risk_surcharge: float
    precision_premium: float
    total_quote: float
    currency: str = "USD"

class QuotingEngine:
    def calculate_quote(
        self, 
        quantity: int, 
        hourly_rate: float, 
        risk_score: float, 
        req_tolerance: float,
        units_per_hour: int = 50
    ) -> QuoteBreakdown:
        """
        Production-level financial logic:
        - Base: (Qty / UnitsPerHr) * Rate
        - Risk: Progressive surcharge based on 0-100 score.
        - Precision: Exponential increase as tolerance tightens (< 0.5mm).
        """
        # 1. Base Cost
        hours_required = quantity / units_per_hour
        base_cost = hours_required * hourly_rate
        
        # 2. Risk Surcharge (0-100 score)
        # 0 score = 0% surcharge, 100 score = 50% surcharge
        risk_multiplier = 1.0 + (risk_score / 200.0)
        risk_surcharge = base_cost * (risk_multiplier - 1.0)
        
        # 3. Precision Premium
        # Baseline is 1.0mm. Every 0.1mm reduction below 0.5mm adds 5% cost.
        precision_premium = 0.0
        if req_tolerance < 0.5:
            premium_pct = (0.5 - req_tolerance) * 0.5 # 50% premium per 1mm delta
            precision_premium = base_cost * premium_pct
            
        total = base_cost + risk_surcharge + precision_premium
        
        return QuoteBreakdown(
            base_manufacturing_cost=round(base_cost, 2),
            risk_surcharge=round(risk_surcharge, 2),
            precision_premium=round(precision_premium, 2),
            total_quote=round(total, 2)
        )

# Production Instance
quoter = QuotingEngine()
