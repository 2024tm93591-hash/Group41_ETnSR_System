import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-prod")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///auth.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ACCESS_TOKEN_EXPIRES = int(os.getenv("ACCESS_TOKEN_EXPIRES_SECONDS", "900"))  # 15 min default
    REFRESH_TOKEN_EXPIRES = int(os.getenv("REFRESH_TOKEN_EXPIRES_SECONDS", "2592000"))  # 30 days default
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ISSUER = os.getenv("JWT_ISSUER", "auth-service")

