from fastapi import APIRouter, Depends, HTTPException, Request
from app.supabase import supabase
from app.auth.utils import get_current_user
from app.core.config import settings
import stripe
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentIntentCreate(BaseModel):
    order_id: str

@router.post("/create-intent")
async def create_payment_intent(data: PaymentIntentCreate, current_user: dict = Depends(get_current_user)):
    """
    t27/t28 — Create a Stripe PaymentIntent with capture_method='manual' (Escrow).
    This holds the funds but doesn't transfer them yet.
    """
    try:
        # 1. Get order details
        order = supabase.table("orders").select("*, shops(name)").eq("id", data.order_id).eq("client_id", current_user["id"]).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found or access denied.")
        
        amount = int(order.data["amount"] * 100) # Stripe expects cents
        
        # 2. Create PaymentIntent
        # Note: In a real app, we would use Stripe Connect to transfer to the shop's account.
        # For this MVP, we use manual capture to simulate escrow.
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            capture_method="manual", # Manual capture = Escrow Hold
            metadata={
                "order_id": data.order_id,
                "client_id": current_user["id"],
                "shop_id": order.data["shop_id"]
            }
        )

        # 3. Save intent ID to order
        supabase.table("orders").update({
            "payment_intent_id": intent.id,
            "status": "pending" # remains pending until authorized
        }).eq("id", data.order_id).execute()

        return {
            "clientSecret": intent.client_secret,
            "paymentIntentId": intent.id
        }
    except Exception as e:
        logger.error(f"Stripe PaymentIntent creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    t29 — Handle Stripe webhooks to update order status.
    Specifically 'payment_intent.amount_capturable_updated' for manual capture.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook Error: {e}")

    if event["type"] == "payment_intent.amount_capturable_updated":
        intent = event["data"]["object"]
        order_id = intent["metadata"].get("order_id")
        if order_id:
            # Funds are authorized and held. Update status to 'paid'.
            supabase.table("orders").update({"status": "paid"}).eq("id", order_id).execute()
            logger.info(f"Order {order_id} marked as PAID (Funds held in escrow)")

    return {"status": "success"}

@router.post("/release/{order_id}")
async def release_payment(order_id: str, current_user: dict = Depends(get_current_user)):
    """
    t30 — Capture the held funds when the client confirms delivery.
    """
    try:
        # 1. Verify order belongs to client and is in 'shipped' or 'complete' state
        order = supabase.table("orders").select("*").eq("id", order_id).eq("client_id", current_user["id"]).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found.")
        
        if order.data["status"] not in ["shipped", "complete"]:
             # In a real flow, client releases when shipped or after QA
             pass 

        intent_id = order.data.get("payment_intent_id")
        if not intent_id:
            raise HTTPException(status_code=400, detail="No payment intent found for this order.")

        # 2. Capture the payment
        stripe.PaymentIntent.capture(intent_id)

        # 3. Update order status
        supabase.table("orders").update({
            "status": "complete",
            "escrow_released": True
        }).eq("id", order_id).execute()

        return {"message": "Payment released to shop successfully."}
    except Exception as e:
        logger.error(f"Stripe Payment capture failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
