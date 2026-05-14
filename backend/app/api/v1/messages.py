from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user
from pydantic import BaseModel
from typing import Optional
from app.core.notifications import create_notification

router = APIRouter()

class MessageSend(BaseModel):
    order_id: str
    content: str


# t23/t24 — Send a message in an order thread
@router.post("/")
async def send_message(data: MessageSend, current_user: dict = Depends(get_current_user)):
    """Send a message in an order-specific thread. Supabase Realtime broadcasts to subscribers."""
    try:
        res = supabase.table("messages").insert({
            "order_id": data.order_id,
            "sender_id": current_user["id"],
            "content": data.content,
        }).execute()

        # t31: Notify recipient
        order = supabase.table("orders").select("client_id, shop_id").eq("id", data.order_id).single().execute()
        if order.data:
            shop = supabase.table("shops").select("owner_id").eq("id", order.data["shop_id"]).single().execute()
            target_id = order.data["client_id"] if current_user["id"] == shop.data.get("owner_id") else shop.data.get("owner_id")
            
            if target_id:
                await create_notification(
                    user_id=target_id,
                    type="message",
                    title="New Message",
                    body=f"New message from {current_user.get('email')}: {data.content[:50]}...",
                    data={"order_id": data.order_id, "message_id": res.data[0]["id"]}
                )

        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# t24 — Fetch all messages for an order thread
@router.get("/{order_id}")
async def get_messages(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for an order thread, ordered by time."""
    try:
        res = supabase.table("messages").select(
            "*, profiles!sender_id(full_name, avatar_url)"
        ).eq("order_id", order_id).order("created_at").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
