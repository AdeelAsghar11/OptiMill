from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user, require_role
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# --- Schemas ---
class QuoteRequest(BaseModel):
    cad_file_id: str
    shop_id: str
    message: Optional[str] = None
    quantity: int = 1

class QuoteSubmit(BaseModel):
    request_id: str
    amount: float
    delivery_days: int
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    quote_id: str


# --- t18: Client requests a quote from a shop ---
@router.post("/request")
async def request_quote(data: QuoteRequest, current_user: dict = Depends(require_role(["client", "admin"]))):
    """Client requests a quote for a CAD file from a specific shop."""
    try:
        # Verify the CAD file belongs to the client
        cad = supabase.table("cad_files").select("id, file_name").eq("id", data.cad_file_id).eq("client_id", current_user["id"]).single().execute()
        if not cad.data:
            raise HTTPException(status_code=404, detail="CAD file not found or access denied.")

        res = supabase.table("quote_requests").insert({
            "client_id": current_user["id"],
            "shop_id": data.shop_id,
            "cad_file_id": data.cad_file_id,
            "quantity": data.quantity,
            "message": data.message,
            "status": "pending",
        }).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t19: Shop sees incoming quote requests ---
@router.get("/requests/incoming")
async def get_incoming_requests(current_user: dict = Depends(require_role(["shop", "admin"]))):
    """Shop master gets all incoming quote requests for their shop."""
    try:
        # Get shop owned by this user
        shop_res = supabase.table("shops").select("id").eq("owner_id", current_user["id"]).single().execute()
        if not shop_res.data:
            raise HTTPException(status_code=404, detail="No shop found for this account.")
        shop_id = shop_res.data["id"]

        res = supabase.table("quote_requests").select(
            "*, cad_files(file_name, feasibility_score, process_recommendation), profiles!client_id(full_name)"
        ).eq("shop_id", shop_id).order("created_at", desc=True).execute()
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t20: Shop submits a formal quote ---
@router.post("/submit")
async def submit_quote(data: QuoteSubmit, current_user: dict = Depends(require_role(["shop", "admin"]))):
    """Shop submits a formal quote with price and delivery time."""
    try:
        # Mark request as quoted
        supabase.table("quote_requests").update({"status": "quoted"}).eq("id", data.request_id).execute()

        res = supabase.table("quotes").insert({
            "request_id": data.request_id,
            "amount": data.amount,
            "delivery_days": data.delivery_days,
            "notes": data.notes,
            "status": "pending",
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t21: Client gets all quotes for a specific request (comparison view) ---
@router.get("/compare/{cad_file_id}")
async def compare_quotes(cad_file_id: str, current_user: dict = Depends(get_current_user)):
    """Client retrieves all quotes for a CAD file to compare."""
    try:
        requests_res = supabase.table("quote_requests").select("id, shop_id, shops(name, rating, location_city)").eq("cad_file_id", cad_file_id).eq("client_id", current_user["id"]).execute()
        request_ids = [r["id"] for r in requests_res.data]
        if not request_ids:
            return []

        quotes_res = supabase.table("quotes").select("*").in_("request_id", request_ids).execute()

        # Merge shop info into each quote
        request_map = {r["id"]: r for r in requests_res.data}
        for q in quotes_res.data:
            q["shop"] = request_map.get(q["request_id"], {}).get("shops", {})
        return quotes_res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- t22: Client accepts a quote → creates an Order ---
@router.post("/accept/{quote_id}")
async def accept_quote(quote_id: str, current_user: dict = Depends(require_role(["client", "admin"]))):
    """Client accepts a quote, which creates a new Order in 'pending' state."""
    try:
        quote = supabase.table("quotes").select("*, quote_requests(shop_id, cad_file_id)").eq("id", quote_id).single().execute()
        if not quote.data:
            raise HTTPException(status_code=404, detail="Quote not found.")

        req = quote.data.get("quote_requests", {})
        order_res = supabase.table("orders").insert({
            "client_id": current_user["id"],
            "shop_id": req.get("shop_id"),
            "quote_id": quote_id,
            "cad_file_id": req.get("cad_file_id"),
            "amount": quote.data["amount"],
            "status": "pending",
        }).execute()

        # Mark quote as accepted
        supabase.table("quotes").update({"status": "accepted"}).eq("id", quote_id).execute()

        return order_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
