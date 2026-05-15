import asyncio
import os
import sys
import logging

# Add the current directory to sys.path so we can import 'app'
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Load .env manually if needed before importing app.core.config
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), "backend", ".env"))

from app.models.material_extractor import MaterialExtractor

async def main():
    print("Seeding material knowledge base...")
    extractor = MaterialExtractor()
    extractor.populate_knowledge_base()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
