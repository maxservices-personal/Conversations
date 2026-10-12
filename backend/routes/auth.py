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


def create_auth_token(user_id):
    """Generate a JWT with a JSON-serializable user ID."""
    return jwt.encode(
        {
            "user_id": str(user_id),
            "exp": datetime.now(timezone.utc)
            + relativedelta(months=Config.JWT_EXPIRATION_MONTHS),
        },
        Config.SECRET_KEY,
        algorithm=Config.JWT_ALGORITHM,
    )


def set_auth_cookie(response, token):
    """Set the authentication cookie consistently across all auth routes."""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=Config.COOKIE_MAX_AGE,
        path="/",
    )
    return response


def clear_auth_cookie(response):
    """Clear the authentication cookie using matching attributes."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="None",
    )
    return response


@auth_bp.route("/google", methods=["POST"])
def google_oauth():
    """Handle Google OAuth authentication."""
    data = request.get_json(silent=True) or {}
    google_token = data.get("token")

    if not google_token:
        return jsonify({"error": "No token provided"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            google_token,
            grequests.Request(),
            Config.GOOGLE_CLIENT_ID,
        )

        if not idinfo.get("email_verified"):
            return jsonify({"error": "Google email is not verified"}), 401

        email = idinfo["email"]
        name = idinfo.get("name", email.split("@")[0])

        user = user_model.find_by_email(email)

        if not user:
            user_data = user_model.create_user(
                username=name,
                email=email,
                password="identified by google",
                profilePic=idinfo.get("picture", ""),
            )

            user_id = user_data["_id"]
            response_data = {
                "message": "User created successfully",
                "user": serialize_data(user_data),
            }
            status_code = 201

        else:
            user_id = user["_id"]
            response_data = {
                "message": "Login successful",
                "user": {
                    "name": user.get("fullName", user["username"]),
                    "email": user["email"],
                },
            }
            status_code = 200

        jwt_token = create_auth_token(user_id)

        response = make_response(
            jsonify(response_data),
            status_code,
        )
        return set_auth_cookie(response, jwt_token)

    except Exception:
        auth_bp.logger.exception("Google OAuth authentication failed")
        return jsonify({"error": "Google authentication failed"}), 400


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Handle user registration."""
    data = request.get_json(silent=True) or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({
            "message": "Username, password and email are required"
        }), 400

    if not isinstance(password, str) or len(password) < 6:
        return jsonify({
            "message": "Password should be at least 6 characters long"
        }), 400

    if user_model.find_by_email(email):
        return jsonify({
            "message": "User with this email already exists"
        }), 409

    if user_model.find_by_username(username):
        return jsonify({
            "message": "User with this username already exists"
        }), 409

    user_data = user_model.create_user(
        username=username,
        email=email,
        password=password,
    )

    jwt_token = create_auth_token(user_data["_id"])

    response = make_response(
        jsonify({
            "message": "User created successfully",
            "user": serialize_data(user_data),
        }),
        201,
    )
    return set_auth_cookie(response, jwt_token)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Handle user login."""
    data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = user_model.find_by_email(email)

    if not user or not user_model.verify_password(
        password, user["password"]
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    jwt_token = create_auth_token(user["_id"])

    response = make_response(
        jsonify({
            "message": "Login successful",
            "user": {
                "name": user.get("fullName", user["username"]),
                "email": user["email"],
            },
        }),
        200,
    )
    return set_auth_cookie(response, jwt_token)


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clear the authentication cookie."""
    response = make_response(
        jsonify({"message": "Logged out"}),
        200,
    )
    return clear_auth_cookie(response)

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