from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "job_tracker"
    GMAIL_CLIENT_ID: str
    GMAIL_CLIENT_SECRET: str 
    GMAIL_REDIRECT_URI: str

    class Config:
        env_file = ".env"

settings = Settings()