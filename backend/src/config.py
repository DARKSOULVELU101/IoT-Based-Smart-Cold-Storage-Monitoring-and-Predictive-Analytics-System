from pydantic_settings import BaseSettings
from typing import List


class DatabaseSettings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/cold_storage"
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:5173"
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@iot-suite.com"
    ADMIN_PASSWORD: str = "admin123"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = DatabaseSettings()
