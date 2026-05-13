from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import require_role
from typing import List
from pydantic import BaseModel

router = APIRouter()

class RuleSchema(BaseModel):
    id: str
    name: str
    condition_code: str
    impact_score: float
    description: str
    is_active: bool

@router.get("/orders")
async def admin_get_orders(current_user: dict = Depends(require_role(["admin"]))):
    try:
        res = supabase.table("orders").select("*, profiles!inner(full_name)").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rules", response_model=List[RuleSchema])
async def get_active_rules():
    res = supabase.table("rules").select("*").eq("is_active", True).execute()
    return res.data

@router.post("/rules")
async def create_or_update_rule(rule: RuleSchema):
    try:
        res = supabase.table("rules").upsert({
            "name": rule.name,
            "description": rule.description,
            "is_active": rule.is_active
        }).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
