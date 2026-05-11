from sqlalchemy import Column, String, Float, Integer, JSON
from app.db.session import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    operator_wage_hr = Column(Float)
    overhead_energy_hr = Column(Float)
    maintenance_cost_hr = Column(Float)
    depreciation_hr = Column(Float)
    total_hourly_rate = Column(Float)
    precision_mm = Column(Float)
    age_years = Column(Integer)
    defect_rate_base = Column(Float)
    material_compat = Column(JSON)
    daily_capacity = Column(Integer)
