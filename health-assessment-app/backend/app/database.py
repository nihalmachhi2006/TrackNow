from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

def get_supabase_client() -> Client:
    """Create and return a Supabase client"""
    if not settings.supabase_url or not settings.supabase_key:
        print("Warning: Supabase credentials not configured")
        return None
    
    supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
    return supabase

# Create a global instance
supabase_client = get_supabase_client()
