from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

VALID_TRANSITIONS = {
    "scheduled": ["completed", "cancelled"],
    "completed": [],
    "cancelled": [],
}

class MeetingCreate(BaseModel):
    order_id: str
    title: str
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_url: Optional[str] = None
    notes: Optional[str] = None

class MeetingUpdate(BaseModel):
    status: str  # "completed" or "cancelled"


# t25/t26 — Schedule a meeting
@router.post("/")
async def schedule_meeting(data: MeetingCreate, current_user: dict = Depends(get_current_user)):
    """Schedule a consultation meeting for a specific order."""
    try:
        res = supabase.table("meetings").insert({
            "order_id": data.order_id,
            "organizer_id": current_user["id"],
            "title": data.title,
            "scheduled_at": data.scheduled_at.isoformat(),
            "duration_minutes": data.duration_minutes,
            "meeting_url": data.meeting_url,
            "notes": data.notes,
            "status": "scheduled",
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# t26 — Get meetings for an order
@router.get("/{order_id}")
async def get_meetings(order_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("meetings").select(
            "*, profiles!organizer_id(full_name)"
        ).eq("order_id", order_id).order("scheduled_at").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# t26 — Update meeting status (complete or cancel)
@router.patch("/{meeting_id}")
async def update_meeting(meeting_id: str, body: MeetingUpdate, current_user: dict = Depends(get_current_user)):
    """Complete or cancel a scheduled meeting."""
    try:
        meeting = supabase.table("meetings").select("status").eq("id", meeting_id).single().execute()
        if not meeting.data:
            raise HTTPException(status_code=404, detail="Meeting not found.")

        allowed = VALID_TRANSITIONS.get(meeting.data["status"], [])
        if body.status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from '{meeting.data['status']}' to '{body.status}'."
            )

        res = supabase.table("meetings").update({"status": body.status}).eq("id", meeting_id).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
