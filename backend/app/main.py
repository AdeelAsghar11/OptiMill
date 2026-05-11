from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.risk import router as risk_router
from app.api.v1.matcher import router as matcher_router
from app.api.v1.quoter import router as quoter_router
from app.api.v1.scheduler import router as scheduler_router
from app.api.v1.admin import router as admin_router

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
app.include_router(matcher_router, prefix="/api/v1/match", tags=["Machine Matching"])
app.include_router(quoter_router, prefix="/api/v1/quote", tags=["Financial Quoting"])
app.include_router(scheduler_router, prefix="/api/v1/schedule", tags=["Production Scheduling"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin Control Panel"])

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
