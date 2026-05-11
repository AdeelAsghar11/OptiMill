from fastapi import APIRouter, HTTPException
from app.schemas.risk import OrderCreate
from app.engine.risk_scorer import engine as risk_engine
from app.engine.matcher import matcher
from app.engine.quoter import quoter, QuoteBreakdown

router = APIRouter()

@router.post("/generate", response_model=QuoteBreakdown)
async def generate_production_quote(order: OrderCreate, machine_id: str):
    """
    Generate a full financial quote for a specific machine matching an order.
    """
    try:
        # 1. Find the specific machine
        target_machine = next((m for m in matcher.machines if m["machine_id"] == machine_id), None)
        if not target_machine:
            raise HTTPException(status_code=404, detail="Machine ID not found.")
            
        # 2. Get Risk Score
        risk_result = risk_engine.analyze(order.model_dump(), target_machine)
        
        # 3. Calculate Quote
        quote = quoter.calculate_quote(
            quantity=order.quantity,
            hourly_rate=target_machine["total_hourly_rate"],
            risk_score=risk_result.total_risk_score,
            req_tolerance=order.required_tolerance,
            units_per_hour=target_machine.get("daily_capacity", 400) // 8 # Approx hourly
        )
        
        return quote
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
