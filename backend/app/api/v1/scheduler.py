from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user

router = APIRouter()

@router.get("/{order_id}/meetings")
async def get_order_meetings(order_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("meetings").select("*").eq("order_id", order_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
