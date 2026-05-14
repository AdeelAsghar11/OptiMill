from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user, require_role
from pydantic import BaseModel
from typing import Optional
from app.core.notifications import create_notification

router = APIRouter()

# t22 — Order state machine:
# pending → paid → in_progress → qa → shipped → complete
VALID_TRANSITIONS = {
    "pending":     ["paid"],
    "paid":        ["in_progress"],
    "in_progress": ["qa"],
    "qa":          ["shipped", "in_progress"],  # can push back to rework
    "shipped":     ["complete"],
    "complete":    [],
}

class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


@router.get("/")
async def list_orders(current_user: dict = Depends(get_current_user)):
    """List all orders for the current user (client or shop)."""
    try:
        profile = supabase.table("profiles").select("role").eq("id", current_user["id"]).single().execute()
        role = profile.data.get("role", "client") if profile.data else "client"

        if role in ("shop", "admin"):
            shop_res = supabase.table("shops").select("id").eq("owner_id", current_user["id"]).execute()
            shop_ids = [s["id"] for s in shop_res.data]
            res = supabase.table("orders").select(
                "*, profiles!client_id(full_name), shops(name), cad_files(file_name)"
            ).in_("shop_id", shop_ids).order("created_at", desc=True).execute()
        else:
            res = supabase.table("orders").select(
                "*, shops(name, location_city), cad_files(file_name, process_recommendation)"
            ).eq("client_id", current_user["id"]).order("created_at", desc=True).execute()

        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single order's full details."""
    try:
        res = supabase.table("orders").select(
            "*, shops(name, location_city), cad_files(*), profiles!client_id(full_name)"
        ).eq("id", order_id).single().execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, body: StatusUpdate, current_user: dict = Depends(get_current_user)):
    """Advance order through the state machine."""
    try:
        order = supabase.table("orders").select("status").eq("id", order_id).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found.")

        current_status = order.data["status"]
        allowed = VALID_TRANSITIONS.get(current_status, [])

        if body.status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from '{current_status}' to '{body.status}'. Allowed: {allowed}"
            )

        res = supabase.table("orders").update({"status": body.status}).eq("id", order_id).execute()

        # t31: Notify other party
        order_full = supabase.table("orders").select("client_id, shop_id").eq("id", order_id).single().execute()
        if order_full.data:
            # If current user is shop, notify client. If current user is client, notify shop owner.
            is_shop = current_user["id"] == order_full.data["shop_id"] # This might be wrong if shop_id is shop uuid not owner uuid
            # Actually shop_id in 'orders' is UUID of 'shops' table. We need shop.owner_id.
            
            shop = supabase.table("shops").select("owner_id").eq("id", order_full.data["shop_id"]).single().execute()
            target_id = order_full.data["client_id"] if current_user["id"] == shop.data.get("owner_id") else shop.data.get("owner_id")
            
            if target_id:
                await create_notification(
                    user_id=target_id,
                    type="order_update",
                    title="Order Status Updated",
                    body=f"Order #{order_id[:8]} is now '{body.status}'.",
                    data={"order_id": order_id, "status": body.status}
                )

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
