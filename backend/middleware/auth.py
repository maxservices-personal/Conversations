from functools import wraps
from flask import request, jsonify
import jwt
from bson import ObjectId
from config import Config
from models.user import UserModel

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get("access_token")
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
            user_id = payload["user_id"]
            
            user_model = UserModel()
            user = user_model.find_by_id(user_id)
            
            if not user:
                return jsonify({"message": "User not found"}), 404
            
            request.user = user
            
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function