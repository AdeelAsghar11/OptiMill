from fastapi import APIRouter, HTTPException
from app.schemas.risk import OrderCreate
from app.engine.risk_scorer import engine as risk_engine
from app.engine.matcher import matcher
from app.engine.scheduler import scheduler, ProductionSchedule

router = APIRouter()

@router.post("/create", response_model=ProductionSchedule)
async def create_production_schedule(order: OrderCreate, machine_id: str):
    """
    Generate a realistic production timeline with risk-based buffers.
    """
    try:
        # 1. Find the specific machine
        target_machine = next((m for m in matcher.machines if m["machine_id"] == machine_id), None)
        if not target_machine:
            raise HTTPException(status_code=404, detail="Machine ID not found.")
            
        # 2. Get Risk Score for buffer calculation
        risk_result = risk_engine.analyze(order.model_dump(), target_machine)
        
        # 3. Create Schedule
        schedule = scheduler.create_schedule(
            quantity=order.quantity,
            daily_capacity=target_machine.get("daily_capacity", 400),
            risk_score=risk_result.total_risk_score
        )
        
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
