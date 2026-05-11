from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.rule import Rule
from pydantic import BaseModel
from typing import List

router = APIRouter()

class RuleSchema(BaseModel):
    id: str
    name: str
    condition_code: str
    impact_score: float
    description: str
    is_active: bool

@router.get("/rules", response_model=List[RuleSchema])
async def get_active_rules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rule))
    return result.scalars().all()

@router.post("/rules", response_model=RuleSchema)
async def create_or_update_rule(rule: RuleSchema, db: AsyncSession = Depends(get_db)):
    db_rule = await db.get(Rule, rule.id)
    if db_rule:
        for key, value in rule.model_dump().items():
            setattr(db_rule, key, value)
    else:
        db_rule = Rule(**rule.model_dump())
        db.add(db_rule)
    
    await db.commit()
    await db.refresh(db_rule)
    return db_rule
