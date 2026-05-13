from pydantic import BaseModel
from typing import List, Optional

class OrderCreate(BaseModel):
    fabric_type: str
    required_tolerance: float
    quantity: int

class MachineInfo(BaseModel):
    id: str
    type: str
    age_years: int
    precision_mm: float

class RiskFactorSchema(BaseModel):
    name: str
    impact_score: float
    reason: str

class RiskAnalysisResponse(BaseModel):
    total_risk_score: float
    risk_level: str
    factors: List[RiskFactorSchema]

class MatchResult(BaseModel):
    machine_id: str
    compatibility_score: float
    reason: Optional[str] = None
