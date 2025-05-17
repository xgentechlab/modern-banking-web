from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # API Configuration
    api_prefix: str = "/api/v1"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS Configuration
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # External API Configuration
    external_api_base_url: str = os.getenv("EXTERNAL_API_BASE_URL", "http://localhost:3000/api")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra='allow'  # This allows extra fields from environment variables
    ) 