from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List

class ProductionSchedule(BaseModel):
    start_date: datetime
    estimated_completion_date: datetime
    total_days: int
    buffer_days: int
    daily_output_target: int

class SchedulingEngine:
    def create_schedule(
        self, 
        quantity: int, 
        daily_capacity: int, 
        risk_score: float,
        start_date: datetime = None
    ) -> ProductionSchedule:
        """
        Production-level scheduling logic:
        - Net Duration: Qty / Capacity
        - Risk Buffer: Add 10-30% buffer based on risk score.
        - Precision Buffer: (Implicit in risk score for now).
        """
        if not start_date:
            start_date = datetime.now()
            
        # 1. Base Duration
        base_days = max(1, quantity // daily_capacity)
        
        # 2. Risk Buffer (Deterministic)
        # Score 0 = 1 day buffer, Score 100 = 5 day buffer (min 10% of duration)
        risk_buffer = max(1, round(risk_score / 20.0))
        
        total_days = base_days + risk_buffer
        completion_date = start_date + timedelta(days=total_days)
        
        return ProductionSchedule(
            start_date=start_date,
            estimated_completion_date=completion_date,
            total_days=total_days,
            buffer_days=risk_buffer,
            daily_output_target=daily_capacity
        )

# Production Instance
scheduler = SchedulingEngine()
