from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
import uuid
from typing import List

router = APIRouter()

@router.post("/")
async def create_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    """Initialize a new manufacturing order via Supabase."""
    try:
        res = supabase.table("orders").insert({
            "client_id": current_user["id"],
            "amount": order_data.get("amount", 0),
            "status": "pending"
        }).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_orders(current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("orders").select("*").eq("client_id", current_user["id"]).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
