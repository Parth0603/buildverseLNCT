import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScamRadar X API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # MongoDB Atlas connection
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb+srv://parthnagar:parth123@eib.ttjeoal.mongodb.net/?appName=eib")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "scamradar_x")
    
    # AI and Transcription APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ASSEMBLYAI_API_KEY: str = os.getenv("ASSEMBLYAI_API_KEY", "")
    
    # Safe Browsing URL Check API Key (Optional)
    SAFE_BROWSING_API_KEY: str = os.getenv("SAFE_BROWSING_API_KEY", "")
    
    # URLhaus abuse.ch API Key (Optional)
    URLHAUS_API_KEY: str = os.getenv("URLHAUS_API_KEY", "")

    # Blockchain Amoy Testnet Mock/Prep Addresses (Future Phase integration placeholders)
    AMOY_TESTNET_RPC: str = "https://rpc-amoy.polygon.technology"
    CONTRACT_ADDRESS: str = "0x5B3DF5F000000000000000000000000000000000"

    class Config:
        case_sensitive = True

settings = Settings()
