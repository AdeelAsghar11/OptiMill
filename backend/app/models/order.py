from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    fabric_type = Column(String)
    required_tolerance = Column(Float)
    quantity = Column(Integer)
    status = Column(String, default="pending") # pending, analyzed, matched, quoted, scheduled
    
    # Snapshot of results
    risk_analysis = Column(JSON, nullable=True)
    matched_machine_id = Column(String, ForeignKey("machines.id"), nullable=True)
    quote_data = Column(JSON, nullable=True)
    schedule_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
