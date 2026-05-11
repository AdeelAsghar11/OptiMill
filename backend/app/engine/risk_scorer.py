from typing import List, Dict, Any
from pydantic import BaseModel
from abc import ABC, abstractmethod

class RiskFactor(BaseModel):
    name: str
    impact_score: float
    reason: str

class RiskAssessment(BaseModel):
    total_risk_score: float
    risk_level: str  # Low, Medium, High
    factors: List[RiskFactor]

class BaseRule(ABC):
    @abstractmethod
    def evaluate(self, order_data: Dict[str, Any], machine_data: Dict[str, Any]) -> List[RiskFactor]:
        pass

class MaterialMachineAgeRule(BaseRule):
    """
    Production Rule: High-complexity materials (Silk/Satin) require precision tension.
    Machines older than 5 years have increased mechanical variance.
    """
    def evaluate(self, order_data: Dict[str, Any], machine_data: Dict[str, Any]) -> List[RiskFactor]:
        factors = []
        fabric_type = order_data.get("fabric_type", "").lower()
        machine_age = machine_data.get("age_years", 0)
        
        high_complexity_fabrics = ["silk", "satin", "fine-cotton"]
        
        if fabric_type in high_complexity_fabrics and machine_age > 5:
            factors.append(RiskFactor(
                name="Mechanical Tension Variance",
                impact_score=25.0,
                reason=f"Machine age ({machine_age} yrs) exceeds reliability threshold for delicate {fabric_type} fabric."
            ))
        return factors

class ToleranceCapabilityRule(BaseRule):
    """
    Production Rule: If requested tolerance is tighter than machine's precision capability.
    """
    def evaluate(self, order_data: Dict[str, Any], machine_data: Dict[str, Any]) -> List[RiskFactor]:
        factors = []
        req_tolerance = order_data.get("required_tolerance", 1.0)
        machine_precision = machine_data.get("precision_mm", 0.5)
        
        if req_tolerance < machine_precision:
            factors.append(RiskFactor(
                name="Precision Mismatch",
                impact_score=50.0,
                reason=f"Requested tolerance ({req_tolerance}mm) is tighter than machine capability ({machine_precision}mm)."
            ))
        return factors

class RiskScoringEngine:
    def __init__(self):
        self.rules: List[BaseRule] = [
            MaterialMachineAgeRule(),
            ToleranceCapabilityRule()
        ]

    def analyze(self, order_data: Dict[str, Any], machine_data: Dict[str, Any]) -> RiskAssessment:
        all_factors = []
        for rule in self.rules:
            all_factors.extend(rule.evaluate(order_data, machine_data))
        
        total_score = sum(f.impact_score for f in all_factors)
        
        if total_score < 20:
            level = "Low"
        elif total_score < 50:
            level = "Medium"
        else:
            level = "High"
            
        return RiskAssessment(
            total_risk_score=min(total_score, 100.0),
            risk_level=level,
            factors=all_factors
        )

# Production Instance
engine = RiskScoringEngine()
