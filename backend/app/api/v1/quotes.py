from fastapi import APIRouter, Depends, HTTPException
from app.supabase import supabase
from app.auth.utils import get_current_user, require_role
from pydantic import BaseModel
from typing import Optional
from app.core.notifications import create_notification

router = APIRouter()

# --- Schemas ---
class QuoteRequest(BaseModel):
    cad_file_id: str
    shop_id: str
    message: Optional[str] = None
    quantity: int = 1

class MultiQuoteRequest(BaseModel):
    cad_file_id: str
    shop_ids: list[str]
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
        
        # t31: Notify shop owner
        shop = supabase.table("shops").select("owner_id, name").eq("id", data.shop_id).single().execute()
        if shop.data:
            await create_notification(
                user_id=shop.data["owner_id"],
                type="quote_received",
                title="New Quote Request",
                body=f"Client {current_user.get('email')} requested a quote for {cad.data['file_name']}.",
                data={"request_id": res.data[0]["id"], "cad_file_id": data.cad_file_id}
            )

        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multi-request")
async def request_multi_quote(data: MultiQuoteRequest, current_user: dict = Depends(require_role(["client", "admin"]))):
    """Client requests quotes from multiple shops for the same CAD file."""
    try:
        # Verify the CAD file belongs to the client
        cad = supabase.table("cad_files").select("id, file_name").eq("id", data.cad_file_id).eq("client_id", current_user["id"]).single().execute()
        if not cad.data:
            raise HTTPException(status_code=404, detail="CAD file not found or access denied.")

        results = []
        for shop_id in data.shop_ids:
            res = supabase.table("quote_requests").insert({
                "client_id": current_user["id"],
                "shop_id": shop_id,
                "cad_file_id": data.cad_file_id,
                "quantity": data.quantity,
                "message": data.message,
                "status": "pending",
            }).execute()
            
            # Notify shop owner
            shop = supabase.table("shops").select("owner_id, name").eq("id", shop_id).single().execute()
            if shop.data:
                await create_notification(
                    user_id=shop.data["owner_id"],
                    type="quote_received",
                    title="New Multi-Quote Request",
                    body=f"Client {current_user.get('email')} requested a quote for {cad.data['file_name']}.",
                    data={"request_id": res.data[0]["id"], "cad_file_id": data.cad_file_id}
                )
            results.append(res.data[0])

        return results
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
        # 1. Get request info to link shop_id and client_id in the quote entry
        req = supabase.table("quote_requests").select("client_id, shop_id, cad_file_id, shops(name)").eq("id", data.request_id).single().execute()
        if not req.data:
            raise HTTPException(status_code=404, detail="Quote request not found.")

        # 2. Mark request as quoted
        supabase.table("quote_requests").update({"status": "quoted"}).eq("id", data.request_id).execute()

        # 3. Insert the quote
        res = supabase.table("quotes").insert({
            "request_id": data.request_id,
            "shop_id": req.data["shop_id"],
            "client_id": req.data["client_id"],
            "amount": data.amount,
            "delivery_days": data.delivery_days,
            "notes": data.notes,
            "status": "pending",
        }).execute()

        # 4. Notify client
        shop_name = "Shop"
        if req.data.get("shops"):
            shop_info = req.data["shops"]
            if isinstance(shop_info, list) and len(shop_info) > 0:
                shop_name = shop_info[0].get("name", "Shop")
            else:
                shop_name = shop_info.get("name", "Shop")

        await create_notification(
            user_id=req.data["client_id"],
            type="quote_received",
            title="Quote Received",
            body=f"Shop '{shop_name}' submitted a quote for ${data.amount}.",
            data={
                "quote_id": res.data[0]["id"], 
                "request_id": data.request_id,
                "cad_file_id": req.data["cad_file_id"]
            }
        )

        return res.data[0]
    except Exception as e:
        print(f"Error in submit_quote: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- t21: Client gets all quotes for a specific request (comparison view) ---
@router.get("/compare/{cad_file_id}")
async def compare_quotes(cad_file_id: str, current_user: dict = Depends(get_current_user)):
    """Client retrieves all quotes for a CAD file to compare."""
    try:
        # 1. Get all quote requests for this CAD file that belong to the current client
        requests_res = supabase.table("quote_requests").select(
            "id, shop_id, shops(name, rating, address)"
        ).eq("cad_file_id", cad_file_id).eq("client_id", current_user["id"]).execute()
        
        request_ids = [r["id"] for r in requests_res.data]
        if not request_ids:
            return []

        # 2. Get all quotes for these requests
        quotes_res = supabase.table("quotes").select("*").in_("request_id", request_ids).execute()

        # 3. Merge shop info into each quote
        # Robustly handle the joined shops (can be object or list)
        request_map = {}
        for r in requests_res.data:
            shop_info = r.get("shops", {})
            if isinstance(shop_info, list) and len(shop_info) > 0:
                shop_info = shop_info[0]
            request_map[r["id"]] = shop_info

        for q in quotes_res.data:
            q["shop"] = request_map.get(q["request_id"], {})
            
        return quotes_res.data
    except Exception as e:
        print(f"Error in compare_quotes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- t22: Client accepts a quote → creates an Order ---
@router.post("/accept/{quote_id}")
async def accept_quote(quote_id: str, current_user: dict = Depends(require_role(["client", "admin"]))):
    """Client accepts a quote, which creates a new Order in 'pending' state."""
    try:
        # Fetch quote with its request details
        quote = supabase.table("quotes").select("*, quote_requests(shop_id, cad_file_id)").eq("id", quote_id).single().execute()
        if not quote.data:
            raise HTTPException(status_code=404, detail="Quote not found.")

        # Robustly handle the joined quote_requests (can be object or list depending on postgrest config)
        req = quote.data.get("quote_requests")
        if isinstance(req, list) and len(req) > 0:
            req = req[0]
        elif not req:
            req = {}

        # Prefer IDs from quotes table if available, fallback to request
        shop_id = quote.data.get("shop_id") or req.get("shop_id")
        cad_file_id = req.get("cad_file_id")

        if not shop_id:
             raise HTTPException(status_code=400, detail="Could not determine shop_id for this order.")

        order_res = supabase.table("orders").insert({
            "client_id": current_user["id"],
            "shop_id": shop_id,
            "quote_id": quote_id,
            "cad_file_id": cad_file_id,
            "amount": quote.data["amount"],
            "status": "pending",
        }).execute()

        # Mark quote as accepted
        supabase.table("quotes").update({"status": "accepted"}).eq("id", quote_id).execute()

        # t31: Notify shop
        shop = supabase.table("shops").select("owner_id").eq("id", req.get("shop_id")).single().execute()
        if shop.data:
            await create_notification(
                user_id=shop.data["owner_id"],
                type="order_placed",
                title="Quote Accepted!",
                body=f"Client {current_user.get('email')} accepted your quote. New order created.",
                data={"order_id": order_res.data[0]["id"], "quote_id": quote_id}
            )

        return order_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
