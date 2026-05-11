from fastapi import APIRouter, HTTPException
from app.schemas.risk import OrderCreate, RiskAnalysisResponse, MachineInfo
from app.engine.risk_scorer import engine

router = APIRouter()

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_production_risk(order: OrderCreate, machine: MachineInfo):
    """
    Production-grade endpoint to analyze quality risk using the rule-based engine.
    """
    try:
        # Transform Pydantic models to dict for the engine
        # In a real production scenario, machine data would be fetched from the DB
        result = engine.analyze(order.model_dump(), machine.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
