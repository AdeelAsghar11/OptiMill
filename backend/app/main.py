from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.risk import router as risk_router

app = FastAPI(
    title="OptiMill: Rule-Based Manufacturing Engine",
    description="Deterministic quality risk scoring and capacity matching engine for manufacturing orchestration.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(risk_router, prefix="/api/v1/risk", tags=["Risk Analysis"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to OptiMill Engine",
        "status": "online",
        "engine_type": "Deterministic Rule-Based"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
