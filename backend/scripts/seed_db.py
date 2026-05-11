import asyncio
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.machine import Machine

async def seed_database():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Load from JSON
        with open("data/machine_rates.json", "r") as f:
            data = json.load(f)
        
        for m_data in data:
            machine = Machine(
                id=m_data["machine_id"],
                type=m_data["type"],
                operator_wage_hr=m_data["operator_wage_hr"],
                overhead_energy_hr=m_data["overhead_energy_hr"],
                maintenance_cost_hr=m_data["maintenance_cost_hr"],
                depreciation_hr=m_data["depreciation_hr"],
                total_hourly_rate=m_data["total_hourly_rate"],
                precision_mm=m_data["precision_mm"],
                age_years=m_data["age_years"],
                defect_rate_base=m_data["defect_rate_base"],
                material_compat=m_data["material_compat"],
                daily_capacity=m_data["daily_capacity"]
            )
            session.add(machine)
        
        await session.commit()
        print(f"Successfully seeded {len(data)} machines into PostgreSQL.")

if __name__ == "__main__":
    asyncio.run(seed_database())
