from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.notifications import create_notification

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
        # Get order details to populate client/shop IDs
        order = supabase.table("orders").select("client_id, shop_id").eq("id", data.order_id).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found.")

        # Insert meeting with correct columns from schema
        res = supabase.table("meetings").insert({
            "order_id": data.order_id,
            "host_id": current_user["id"],
            "client_id": order.data["client_id"],
            "shop_id": order.data["shop_id"],
            "title": data.title,
            "scheduled_at": data.scheduled_at.isoformat(),
            "duration_minutes": data.duration_minutes,
            "meet_link": data.meeting_url,
            "notes": data.notes,
            "status": "scheduled",
        }).execute()

        # t31: Notify other party
        order = supabase.table("orders").select("client_id, shop_id").eq("id", data.order_id).single().execute()
        if order.data:
            shop = supabase.table("shops").select("owner_id").eq("id", order.data["shop_id"]).single().execute()
            target_id = order.data["client_id"] if current_user["id"] == shop.data.get("owner_id") else shop.data.get("owner_id")
            
            if target_id:
                await create_notification(
                    user_id=target_id,
                    type="meeting",
                    title="New Meeting Scheduled",
                    body=f"A meeting '{data.title}' has been scheduled for {data.scheduled_at.strftime('%Y-%m-%d %H:%M')}.",
                    data={"order_id": data.order_id, "meeting_id": res.data[0]["id"]}
                )

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
