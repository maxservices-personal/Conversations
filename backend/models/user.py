from bson import ObjectId
from datetime import datetime, timezone
import bcrypt

class UserModel:
    """User model for database operations"""
    
    def __init__(self):
        from database.connection import db_instance
        self.collection = db_instance.get_collection("users2")
    
    def create_user(self, username, email, password, **kwargs):
        """Create a new user"""
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        
        user_data = {
            "username": username,
            "email": email,
            "password": hashed_password,
            "createdAt": datetime.now(timezone.utc),
            "profilePic": kwargs.get("profilePic", ""),
            "plan": kwargs.get("plan", "free"),
            "memory": [],
            "isSetUp": kwargs.get("isSetUp", False),
            "phone_number": kwargs.get("phone_number", None),
            "bio": kwargs.get("bio", ""),
            "last_seen": None,
            "followers": 0,
            "following": 0
        }
        
        result = self.collection.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        user_data.pop("password")
        
        return user_data
    
    def find_by_email(self, email):
        """Find user by email"""
        return self.collection.find_one({"email": email})
    
    def find_by_id(self, user_id):
        """Find user by ID"""
        return self.collection.find_one({"_id": ObjectId(user_id)})
    
    def find_by_username(self, username):
        """Find user by username"""
        return self.collection.find_one({"username": username})
    
    def verify_password(self, plain_password, hashed_password):
        """Verify password"""
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password)
    
    def update_profile(self, user_id, **kwargs):
        """Update user profile"""
        update_data = {k: v for k, v in kwargs.items() if v is not None}
        
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        return result.matched_count > 0
    
    def update_last_seen(self, user_id, timestamp):
        """Update user's last seen timestamp"""
        self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_seen": timestamp}}
        )
    
    def get_all_users(self):
        """Get all users"""
        return list(self.collection.find({}, {"password": 0}))

    def get_user_by_handle(self, handle):
        return self.collection.find_one({"username": handle})