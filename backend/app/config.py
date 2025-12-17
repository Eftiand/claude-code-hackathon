from __future__ import annotations

from functools import lru_cache
from typing import Literal, Union, List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Globe Notes API"
    app_version: str = "1.0.0"
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite+aiosqlite:///./globe_notes.db"
    database_echo: bool = False

    # Security
    ip_hash_salt: str = "change-this-secret-salt"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5175", "http://localhost:3000"]

    # Rate Limiting
    rate_limit_requests: int = 5
    rate_limit_window_hours: int = 1

    # Geolocation
    geolocation_timeout: float = 5.0
    geolocation_provider: Literal["ipapi", "maxmind", "mock"] = "ipapi"
    maxmind_db_path: str = "./data/GeoLite2-City.mmdb"

    # Content Filter
    content_filter_enabled: bool = True
    custom_blocked_words: list[str] = []

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            import json

            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def async_database_url(self) -> str:
        """Ensure database URL is async-compatible."""
        if self.database_url.startswith("sqlite:"):
            return self.database_url.replace("sqlite:", "sqlite+aiosqlite:")
        if self.database_url.startswith("postgresql:"):
            return self.database_url.replace("postgresql:", "postgresql+asyncpg:")
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
