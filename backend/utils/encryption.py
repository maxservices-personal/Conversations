from cryptography.fernet import Fernet
from config import Config

class EncryptionService:
    """Service for encrypting/decrypting messages"""
    
    def __init__(self):
        self.cipher = Fernet(Config.MESSAGE_SECRET_KEY.encode())
    
    def encrypt(self, text):
        """Encrypt text"""
        return self.cipher.encrypt(text.encode())
    
    def decrypt(self, encrypted_text):
        """Decrypt text"""
        try:
            return self.cipher.decrypt(encrypted_text).decode()
        except Exception:
            return "[decryption_error]"


encryption_service = EncryptionService()