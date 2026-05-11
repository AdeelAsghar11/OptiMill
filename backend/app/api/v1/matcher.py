from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.schemas.risk import OrderCreate
from app.engine.matcher import matcher, MatchResult

router = APIRouter()

@router.post("/match", response_model=List[MatchResult])
async def match_production_line(order: OrderCreate):
    """
    Find the best production machines for a given order spec.
    """
    try:
        results = matcher.find_matches(
            fabric_type=order.fabric_type,
            req_tolerance=order.required_tolerance
        )
        if not results:
            raise HTTPException(status_code=404, detail="No compatible production lines found for these specifications.")
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
