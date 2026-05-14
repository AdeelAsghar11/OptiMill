from app.supabase import supabase
from typing import Optional, Dict, Any
from app.core.email import send_email
import logging

logger = logging.getLogger(__name__)

async def create_notification(
    user_id: str,
    type: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None,
    to_email: Optional[str] = None
):
    """
    Utility to create a notification record in Supabase.
    Types: 'quote_received', 'order_update', 'message', 'meeting', 'payment'
    """
    try:
        res = supabase.table("notifications").insert({
            "user_id": user_id,
            "type": type,
            "title": title,
            "body": body,
            "data": data or {},
            "read": False
        }).execute()
        
        # t33: Send email if requested
        if to_email:
            await send_email(
                to=to_email,
                subject=title,
                html_content=f"<h3>{title}</h3><p>{body}</p><br/><a href='https://optimill.io/dashboard'>Go to Dashboard</a>"
            )

        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        return None
