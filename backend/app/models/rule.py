from sqlalchemy import Column, String, Float, Integer, Boolean
from app.db.session import Base

class Rule(Base):
    __tablename__ = "rules"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    condition_code = Column(String) # e.g., "machine.age > 5 and fabric == 'silk'"
    impact_score = Column(Float)
    description = Column(String)
    is_active = Column(Boolean, default=True)
