from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OptiMill: Rule-Based Manufacturing Engine",
    description="Deterministic quality risk scoring and capacity matching engine for manufacturing orchestration.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
