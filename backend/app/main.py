from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.risk import router as risk_router
from app.api.v1.matcher import router as matcher_router
from app.api.v1.quoter import router as quoter_router
from app.api.v1.scheduler import router as scheduler_router
from app.api.v1.admin import router as admin_router
from app.api.v1.orders import router as orders_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cad import router as cad_router
from app.api.v1.shops import router as shops_router
from app.api.v1.quotes import router as quotes_router
from app.api.v1.messages import router as messages_router
from app.api.v1.meetings import router as meetings_router
from app.api.v1.payments import router as payments_router
from app.api.v1.locations import router as locations_router
from app.api.v1.external_suppliers import router as external_suppliers_router

app = FastAPI(
    title="OptiMill: AI-Powered CAD Marketplace",
    description="Cross-platform marketplace for CAD analysis, manufacturing matching, and escrow payments.",
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
app.include_router(orders_router, prefix="/api/v1/orders", tags=["Order Management"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(cad_router, prefix="/api/v1/cad", tags=["CAD Analysis"])
app.include_router(shops_router, prefix="/api/v1/shops", tags=["Shop Marketplace"])
app.include_router(quotes_router, prefix="/api/v1/quotes", tags=["Quoting & Orders"])
app.include_router(messages_router, prefix="/api/v1/messages", tags=["Messaging"])
app.include_router(meetings_router, prefix="/api/v1/meetings", tags=["Meetings"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(locations_router, prefix="/api/v1/locations", tags=["Geolocation"])
app.include_router(external_suppliers_router, prefix="/api/v1/external-suppliers", tags=["External Suppliers"])

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
