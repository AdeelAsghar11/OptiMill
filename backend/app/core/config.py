from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "OptiMill"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    RESEND_API_KEY: str = ""
    REDIS_URL: str = "redis://redis:6379/0"
    PLATFORM_MARGIN: float = 0.10
    ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
