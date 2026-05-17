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
        res = supabase.table("shops").select("*").execute()
        all_shops = res.data
        
        shops = []
        for shop in all_shops:
            if capability:
                shop_caps = [c.lower() for c in (shop.get("capabilities") or [])]
                if capability.lower() not in shop_caps:
                    continue
            if material:
                shop_mats = [m.lower() for m in (shop.get("materials") or [])]
                if material.lower() not in shop_mats:
                    continue
            shops.append(shop)
            
        return shops
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
