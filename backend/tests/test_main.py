import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_read_main():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_risk_engine_logic():
    # Test Silk + Old Machine = High Risk
    order = {"fabric_type": "silk", "required_tolerance": 0.1, "quantity": 100}
    machine = {"id": "M1", "type": "Stitcher", "age_years": 10, "precision_mm": 0.5}
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/risk/analyze", json={"order": order, "machine": machine})
    
    assert response.status_code == 200
    assert response.json()["risk_level"] == "High"

@pytest.mark.asyncio
async def test_matching_logic():
    order = {"fabric_type": "denim", "required_tolerance": 0.5, "quantity": 100}
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/match/match", json=order)
    
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["machine_id"].startswith("MCN")
