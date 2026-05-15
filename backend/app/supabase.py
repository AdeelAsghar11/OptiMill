from supabase import create_client, Client, ClientOptions
from app.core.config import settings

# Increase timeout to handle slow SSL handshakes or high-latency connections
options = ClientOptions(
    postgrest_client_timeout=30,
    storage_client_timeout=30,
    schema="public"
)

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY, options=options)

def get_supabase() -> Client:
    return supabase
