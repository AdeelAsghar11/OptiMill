from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.risk import OrderCreate, RiskAnalysisResponse, MachineInfo, MatchResult
from app.engine.risk_scorer import engine

router = APIRouter()

@router.post("/match", response_model=List[MatchResult])
async def match_production_line(order: OrderCreate):
    """
    ### Deterministic Machine Matching
    Calculates a multi-criteria score based on:
    1. **Material Compatibility** (Filter)
    2. **Precision Margin** (Weight: 20%)
    3. **Operational Efficiency** (Weight: 40%)
    4. **Historical Quality Score** (Weight: 40%)
    """
    try:
        # Transform Pydantic models to dict for the engine
        # In a real production scenario, machine data would be fetched from the DB
        result = engine.analyze(order.model_dump(), machine.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
