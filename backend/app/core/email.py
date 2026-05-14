import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

async def send_email(to: str, subject: str, html_content: str):
    """
    Sends an email using Resend API via HTTP.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set. Skipping email.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "OptiMill <notifications@optimill.io>", # In production, this must be a verified domain
        "to": [to],
        "subject": subject,
        "html": html_content
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 201:
                return True
            else:
                logger.error(f"Resend API error: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
