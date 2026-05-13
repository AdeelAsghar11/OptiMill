from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
from typing import List

router = APIRouter()

@router.get("/shops")
async def get_matching_shops(capability: str = None, material: str = None):
    """
    Find shops based on capabilities and materials (TRD Phase 3).
    """
    try:
        query = supabase.table("shops").select("*")
        if capability:
            query = query.contains("capabilities", [capability])
        if material:
            query = query.contains("materials", [material])
        
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
