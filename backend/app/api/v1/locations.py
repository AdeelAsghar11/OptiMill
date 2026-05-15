from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    city: Optional[str] = None
    province: Optional[str] = None
    country: Optional[str] = None

@router.post("/")
async def update_user_location(
    location: LocationUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Store or update user's current location."""
    try:
        # Update user_locations table
        res = supabase.table("user_locations").upsert({
            "user_id": current_user["id"],
            "latitude": location.latitude,
            "longitude": location.longitude,
            "city": location.city,
            "province": location.province,
            "country": location.country,
            "last_updated": datetime.utcnow().isoformat()
        }).execute()
        
        return {"status": "success", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_my_location(current_user: dict = Depends(get_current_user)):
    """Retrieve current user's last known location."""
    try:
        res = supabase.table("user_locations").select("*").eq("user_id", current_user["id"]).single().execute()
        return res.data
    except Exception as e:
        # If no location found, return null or default
        return None
