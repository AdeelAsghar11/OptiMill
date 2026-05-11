from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.order import Order
from app.models.machine import Machine
from app.schemas.risk import OrderCreate
from app.engine.risk_scorer import engine as risk_engine
from app.engine.matcher import matcher
from app.engine.quoter import quoter
from app.engine.scheduler import scheduler
import uuid
from typing import List

router = APIRouter()

@router.post("/", response_model=dict)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Initialize a new manufacturing order."""
    order_id = str(uuid.uuid4())[:8]
    new_order = Order(
        id=order_id,
        fabric_type=order_data.fabric_type,
        required_tolerance=order_data.required_tolerance,
        quantity=order_data.quantity
    )
    db.add(new_order)
    await db.commit()
    return {"order_id": order_id, "message": "Order initialized successfully"}

@router.post("/{order_id}/run-pipeline")
async def run_full_pipeline(order_id: str, db: AsyncSession = Depends(get_db)):
    """
    Execute the entire 'Golden Path' for an order: 
    Analyze -> Match -> Quote -> Schedule
    """
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # 1. Match (Find the best machine)
    matches = matcher.find_matches(order.fabric_type, order.required_tolerance)
    if not matches:
        raise HTTPException(status_code=404, detail="No matching machines found")
    
    best_match = matches[0]
    target_machine = next(m for m in matcher.machines if m["machine_id"] == best_match.machine_id)
    
    # 2. Analyze Risk
    risk_result = risk_engine.analyze(
        {"fabric_type": order.fabric_type, "required_tolerance": order.required_tolerance},
        target_machine
    )
    
    # 3. Generate Quote
    quote_result = quoter.calculate_quote(
        order.quantity,
        target_machine["total_hourly_rate"],
        risk_result.total_risk_score,
        order.required_tolerance,
        target_machine["daily_capacity"] // 8
    )
    
    # 4. Generate Schedule
    schedule_result = scheduler.create_schedule(
        order.quantity,
        target_machine["daily_capacity"],
        risk_result.total_risk_score
    )
    
    # Update Order Persistence
    order.risk_analysis = risk_result.model_dump()
    order.matched_machine_id = best_match.machine_id
    order.quote_data = quote_result.model_dump()
    order.schedule_data = schedule_result.model_dump()
    order.status = "scheduled"
    
    await db.commit()
    return {
        "status": "success",
        "analysis": order.risk_analysis,
        "machine": best_match,
        "quote": order.quote_data,
        "schedule": order.schedule_data
    }

@router.get("/", response_model=List[dict])
async def list_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    return [{"id": o.id, "status": o.status, "fabric": o.fabric_type, "qty": o.quantity} for o in result.scalars().all()]
