from flask import Blueprint, jsonify, make_response, request
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from linkpreview import link_preview

from config import Config
from models.user import UserModel
from middleware.auth import token_required
from utils.serializers import serialize_data
from utils.file_handler import FileHandler

auth_bp = Blueprint("auth", __name__)
user_model = UserModel()


@auth_bp.route("/google", methods=["POST"])
def google_oauth():
    """Handle Google OAuth authentication"""
    token = request.json.get("token")
    
    if not token:
        return jsonify({"error": "No token provided"}), 400
    
    try:
        idinfo = id_token.verify_oauth2_token(
            token, grequests.Request(), Config.GOOGLE_CLIENT_ID
        )
        
        email = idinfo["email"]
        name = idinfo["name"]
        
        user = user_model.find_by_email(email)
        
        if not user:
            user_data = user_model.create_user(
                username=name,
                email=email,
                password="identified by google",
                profilePic=idinfo.get("picture", "")
            )
            
            jwt_token = jwt.encode(
                {
                    "user_id": user_data["_id"],
                    "exp": datetime.now(timezone.utc) + relativedelta(months=Config.JWT_EXPIRATION_MONTHS)
                },
                Config.SECRET_KEY,
                algorithm=Config.JWT_ALGORITHM
            )
            
            response = make_response(
                jsonify({"message": "User created successfully", "user": user_data}), 201
            )
        else:
            jwt_token = jwt.encode(
                {
                    "user_id": str(user["_id"]),
                    "exp": datetime.now(timezone.utc) + relativedelta(months=Config.JWT_EXPIRATION_MONTHS)
                },
                Config.SECRET_KEY,
                algorithm=Config.JWT_ALGORITHM
            )
            
            response = make_response(
                jsonify({
                    "message": "Login successful",
                    "user": {"name": user["username"], "email": user["email"]}
                }), 200
            )
        
        response.set_cookie(
            "access_token",
            jwt_token,
            httponly=Config.COOKIE_HTTPONLY,
            secure=Config.COOKIE_SECURE,
            max_age=Config.COOKIE_MAX_AGE,
            samesite=Config.COOKIE_SAMESITE
        )
        
        return response
        
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Handle user registration"""
    data = request.json
    
    if not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Name, password and email are required"}), 400
    
    if len(data.get("password")) < 6:
        return jsonify({"message": "Password should be at least 6 characters long"}), 400
    
    if user_model.find_by_email(data["email"]):
        return jsonify({"message": "User with this email already exists"}), 400
    
    if user_model.find_by_username(data["username"]):
        return jsonify({"message": "User with this username already exists"}), 400
    
    user_data = user_model.create_user(
        username=data["username"],
        email=data["email"],
        password=data["password"]
    )
    
    jwt_token = jwt.encode(
        {
            "user_id": user_data["_id"],
            "exp": datetime.now(timezone.utc) + relativedelta(months=Config.JWT_EXPIRATION_MONTHS)
        },
        Config.SECRET_KEY,
        algorithm=Config.JWT_ALGORITHM
    )
    
    response = make_response(
        jsonify({"message": "User created successfully", "user": user_data}), 201
    )
    
    response.set_cookie(
        "access_token",
        jwt_token,
        httponly=Config.COOKIE_HTTPONLY,
        secure=Config.COOKIE_SECURE,
        max_age=Config.COOKIE_MAX_AGE,
        samesite=Config.COOKIE_SAMESITE
    )
    
    return response


@auth_bp.route("/login", methods=["POST"])
def login():
    """Handle user login"""
    data = request.json
    
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400
    
    user = user_model.find_by_email(data["email"])
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user_model.verify_password(data["password"], user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    jwt_token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "exp": datetime.now(timezone.utc) + relativedelta(months=Config.JWT_EXPIRATION_MONTHS)
        },
        Config.SECRET_KEY,
        algorithm=Config.JWT_ALGORITHM
    )
    
    response = make_response(
        jsonify({
            "message": "Login successful",
            "user": {"name": user.get("fullName", user["username"]), "email": user["email"]}
        }), 200
    )
    
    response.set_cookie(
        "access_token",
        jwt_token,
        httponly=Config.COOKIE_HTTPONLY,
        secure=Config.COOKIE_SECURE,
        max_age=Config.COOKIE_MAX_AGE,
        samesite=Config.COOKIE_SAMESITE
    )
    
    return response


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Handle user logout"""
    response = make_response(jsonify({"message": "Logged out"}), 200)
    response.delete_cookie("access_token")
    return response


@auth_bp.route("/check", methods=["GET"])
@token_required
def check_auth():
    """Check authentication status"""
    try:
        user_data = serialize_data(request.user)
        return jsonify(user_data), 200
    except Exception as error:
        print("Error in check_auth:", error)
        return jsonify({"message": "Internal Server Error"}), 500


@auth_bp.route("/setup/profile", methods=["POST"])
@token_required
def setup_profile():
    """Setup user profile"""
    user_data = request.user
    data = request.json
    
    success = user_model.update_profile(
        user_data["_id"],
        profilePic=data.get("profilePic", ""),
        name=data.get("name", ""),
        bio=data.get("bio", ""),
        phone_number=data.get("phoneNumber", ""),
        isSetUp=True
    )
    
    if not success:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({"message": "Profile updated successfully"}), 200


@auth_bp.route("/get/users", methods=["GET"])
@token_required
def get_users():
    """Get all users"""
    users = user_model.get_all_users()
    users = [serialize_data(user) for user in users]
    return jsonify(users), 200


@auth_bp.route("/get/linkpreview", methods=["POST"])
def get_link_preview():
    """Get link preview"""
    data = request.json
    url = data.get("link")
    
    if not url:
        return jsonify({"error": "No link provided"}), 404
    
    preview = link_preview(url)
    
    return jsonify({
        "title": preview.title,
        "description": preview.description,
        "image": preview.image
    }), 200


@auth_bp.route("/upload/files", methods=["POST"])
@token_required
def upload_files():
    """Handle file uploads"""
    if 'files' not in request.files:
        return jsonify({"message": "No files provided"}), 404
    
    files = request.files.getlist('files')
    file_types = request.form.getlist('fileTypes[]')
    
    if len(files) == 0:
        return jsonify({"message": "Files not provided"}), 404
    
    saved_files = FileHandler.save_files(files, file_types)
    
    return jsonify({
        "message": "Files uploaded successfully",
        "files": saved_files,
        "count": len(saved_files)
    }), 200