import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    SECRET_KEY = os.getenv("SECRET_KEY_ETC")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    MONGODB_URI = os.getenv("MONGODB_URI")
    MESSAGE_SECRET_KEY = os.getenv("MESSAGE_SECRET_KEY")
    
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'webp'}
    
    CORS_ORIGINS = ["http://localhost:5173"]
    
    COOKIE_MAX_AGE = 3 * 30 * 24 * 60 * 60 # 3 m
    COOKIE_HTTPONLY = True
    COOKIE_SECURE = True
    COOKIE_SAMESITE = "Strict"
    
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_MONTHS = 3

