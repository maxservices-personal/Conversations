import os
import uuid
from flask import Blueprint, jsonify, make_response, request
from flask_cors import cross_origin
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import bcrypt
import jwt
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from functools import wraps
from bson import ObjectId
from cryptography.fernet import Fernet
from linkpreview import link_preview
from werkzeug.utils import secure_filename
from dotenv import load_dotenv; load_dotenv();
from PIL import Image

from connect import connect

authRoutes = Blueprint("auth", __name__)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SECRET_KEY = os.getenv("SECRET_KEY_ETC")
db = connect()
collection = db["users2"]
friends_collection = db["friends"]
notifications_collection = db["notifications"]
messages_collection = db["chat_messages"]
MESSAGE_SECRET_KEY = os.getenv("MESSAGE_SECRET_KEY")
f = Fernet(MESSAGE_SECRET_KEY.encode())


@authRoutes.route("/google", methods=["POST"])
def googleOAuth():
	token = request.json.get("token")
	if not token:
		print(token)
		return jsonify({"error": "No token provided"}), 400
	try:
		idinfo = id_token.verify_oauth2_token(token, grequests.Request(), GOOGLE_CLIENT_ID)

		email = idinfo["email"]
		name = idinfo["name"]

		user = collection.find_one({"email": email})
		if not user:
			data = {
				"username": name,
				"email": email,
				"password": "identified by google",
				"createdAt": datetime.now(timezone.utc),
				"profilePic": idinfo.get("picture", ""),
				"plan": "free",
				"memory": [],
				"isSetUp": False,
				"phone_number": None,
			}

			result = collection.insert_one(data)
			data["_id"] = str(result.inserted_id)

			data.pop("password")

			token = jwt.encode(
				{
					"user_id": str(result.inserted_id),
					"exp": datetime.now(timezone.utc) + relativedelta(months=3),
				},
				SECRET_KEY,
				algorithm="HS256",
			)

			response = make_response(
				jsonify({"message": "User created successfully", "user": data}), 201
			)

			response.set_cookie(
				"access_token",
				token,
				httponly=True,
				secure=True,
				max_age=3 * 30 * 24 * 60 * 60,
				samesite="Strict",
			)

			return response
		else:
			_id = user["_id"]
			token = jwt.encode(
				{
					"user_id": str(user["_id"]),
					"exp": datetime.now(timezone.utc) + relativedelta(months=3),
				},
				SECRET_KEY,
				algorithm="HS256",
			)

			response = make_response(
				jsonify(
					{
						"message": "Login successful",
						"user": {"name": user["username"], "email": user["email"]},
					}
				),
				200,
			)

			response.set_cookie(
				"access_token",
				token,
				httponly=True,
				secure=True,
				max_age=3 * 30 * 24 * 60 * 60,
				samesite="Strict",
			)

			return response

	except Exception as e:
		print(e)
		return jsonify({"error": str(e)}), 400

@authRoutes.route("/signup", methods=["POST"])
def signup():
	data = request.json
	if not data.get("username") or not data.get("email") or not data.get("password"):
		return jsonify({"message": "Name, password and email are required"}), 400

	if int(len(data.get("password"))) < 6:
		return (
			jsonify({"message": "Password should be at least 6 characters long"}),
			400,
		)

	if collection.find_one({"email": data["email"]}):
		return jsonify({"message": "User with this email already exists"}), 400
	
	if collection.find_one({"username": data["username"]}):
		return jsonify({"message": "User with this username already exists"}), 400
		
	password = data["password"]
	hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
	data["password"] = hashed_password
	data["createdAt"] = datetime.now(timezone.utc)
	data["profilePic"] = ""
	data["plan"] = "free"
	data["memory"] = []
	data["isSetUp"] = False
	data["phone_number"] = None


	result = collection.insert_one(data)

	data["_id"] = str(result.inserted_id)

	data.pop("password")

	token = jwt.encode(
		{
			"user_id": str(result.inserted_id),
			"exp": datetime.now(timezone.utc) + relativedelta(months=3),
		},
		SECRET_KEY,
		algorithm="HS256",
	)

	response = make_response(
		jsonify({"message": "User created successfully", "user": data}), 201
	)

	response.set_cookie(
		"access_token",
		token,
		httponly=True,
		secure=True,
		max_age=3 * 30 * 24 * 60 * 60,
		samesite="Strict",
	)

	return response


@authRoutes.route("/login", methods=["POST"])
def login_user():
	data = request.json

	if not data.get("email") or not data.get("password"):
		return jsonify({"error": "Email and password are required"}), 400

	user = collection.find_one({"email": data["email"]})

	if not user:
		return jsonify({"error": "Invalid credentials"}), 401

	if not bcrypt.checkpw(data["password"].encode("utf-8"), user["password"]):
		return jsonify({"error": "Invalid credentials"}), 401

	token = jwt.encode(
		{
			"user_id": str(user["_id"]),
			"exp": datetime.now(timezone.utc) + relativedelta(months=3),
		},
		SECRET_KEY,
		algorithm="HS256",
	)

	response = make_response(
		jsonify(
			{
				"message": "Login successful",
				"user": {"name": user["fullName"], "email": user["email"]},
			}
		),
		200,
	)

	response.set_cookie(
		"access_token",
		token,
		httponly=True,
		secure=True,
		max_age=3 * 30 * 24 * 60 * 60,
		samesite="Strict",
	)

	return response


@authRoutes.route("/logout", methods=["POST"])
def logout_user():
	response = make_response(jsonify({"message": "Logged out"}), 200)
	response.delete_cookie("access_token")
	return response


def token_required(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		token = request.cookies.get("access_token")
		if not token:
			return jsonify({"message": "Token is missing"}), 401

		try:
			payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
			user_id = payload["user_id"]

			user = collection.find_one({"_id": ObjectId(user_id)})
			if not user:
				return jsonify({"message": "User not found"}), 404

			request.user = user 

		except jwt.ExpiredSignatureError:
			return jsonify({"message": "Token has expired"}), 401
		except jwt.InvalidTokenError:
			return jsonify({"messgae": "Invalid token"}), 401

		return f(*args, **kwargs)

	return decorated_function


def serialize_data(data):
	if isinstance(data, list):
		return [serialize_data(item) for item in data]
	elif isinstance(data, dict):
		return {k: serialize_data(v) for k, v in data.items()}
	elif isinstance(data, ObjectId):
		return str(data)
	elif isinstance(data, bytes):
		return data.decode('utf-8', errors='ignore')
	elif isinstance(data, datetime):
		return data.isoformat()
	else:
		return data

@authRoutes.route("/check", methods=["GET"])
@token_required
def check_auth():
	try:
		user_data = request.user
		user_data = serialize_data(user_data)
		return jsonify(user_data), 200
	except Exception as error:
		print("Error in check_auth:", error)
		return jsonify({"message": "Internal Server Error"}), 500

@authRoutes.route("/setup/profile", methods=["POST"])
@token_required
def setup_profile():
	user_data = request.user
	print(user_data)
	data = request.json
	profile_pic = data.get("profilePic", "")
	display_name = data.get("name", "")
	bio = data.get("bio", "")
	phone_number = data.get("phoneNumber", "")

	result = collection.update_one(
		{"_id": user_data["_id"]},
		{
			"$set": {
				"profilePic": profile_pic,
				"name": display_name,
				"bio": bio,
				"phone_number": phone_number,
				"isSetUp": True,
			}
		}
	)
	
	if result.matched_count == 0:
		return jsonify({"message": "User not found"}), 404


	return jsonify({"message": "Profile updated successfully"}), 200

@authRoutes.route("/get/users", methods=["GET"])
@token_required
def get_users():
	users = collection.find()
	users = [serialize_data(user) for user in users]
	return jsonify(users), 200


@authRoutes.route("/get/friends", methods=["POST"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
@token_required
def get_friends():
	user_data = request.user

	friend_list = friends_collection.find_one({"connected_user_id": ObjectId(user_data["_id"])})
	if not friend_list:
		return jsonify({"friend_list": []})

	friends_userids = [f.get("user_id") for f in friend_list.get("friends", []) if f.get("user_id")]
	if not friends_userids:
		return jsonify({"friend_list": []})

	friends = list(collection.find({"_id": {"$in": friends_userids}}, {"password": 0}))
	new_friend_list = [serialize_data(friend) for friend in friends]

	return jsonify({"friend_list": new_friend_list})

@authRoutes.route("/get/friend_requests", methods=['POST'])
@token_required
def get_friend_requests():
	user_data = request.user
	notification_box = notifications_collection.find_one({"connected_user_id": user_data["_id"]})
	if notification_box:
		notifications = notification_box.get("notifications", [])
		friend_requests = []
		for notification in notifications:
			if notification["type"] == "friend_req":
				friend_requests.append(notification)
		
		friends_userids = []
		for fri_id in friend_requests:
			friends_userids.append(ObjectId(fri_id["from"]))

		print(friend_requests)
		print(friends_userids)
		friend_requests = [serialize_data(friend) for friend in list(collection.find({"_id": {"$in": friends_userids}}, {"password": 0}))]
		print(friend_requests)

		return jsonify({"data":friend_requests})


@authRoutes.route("/get/notifications", methods=["POST"])
@token_required
def get_notifications():
	user_data = request.user

	notification_box = notifications_collection.find_one({"connected_user_id": user_data["_id"]})
	if notification_box:
		notifications = notification_box.get("notifications", [])
		return jsonify({"notifications": notifications})
	return jsonify({"notifications": []})

@authRoutes.route("/get/messages", methods=["POST"])
@token_required
def get_messages():
	user_data = request.user
	data = request.json

	sender_id = user_data.get("_id", None)
	receiver_id = data.get("receiver_id", None)

	if sender_id is None or receiver_id is None:
		return jsonify({"message": "Sender or Receiver ID missing!"}), 400

	messages = list(messages_collection.find({
		"$or": [
			{"sender_id": ObjectId(sender_id), "receiver_id": ObjectId(receiver_id)},
			{"sender_id": ObjectId(receiver_id), "receiver_id": ObjectId(sender_id)}
		]
	}).sort("timestamp", 1)) 

	output = []
	for msg in messages:
		try:
			decrypted_text = f.decrypt(msg["text"]).decode()
		except Exception:
			decrypted_text = "[decryption_error]"
		

		output.append({
			"id": str(msg.get("id", "")),
			"text": decrypted_text,
			"sender_id": str(msg.get("sender_id", "")),
			"receiver_id": str(msg.get("receiver_id", "")),
			"timestamp": str(msg.get("timestamp", "")),
			"reply": msg.get("reply", None),
			"sending_time": msg.get("sending_time", ""),
		})

	return jsonify({"messages": output}), 200


@authRoutes.route("/get/linkpreview", methods=["POST"])
def get_linkpreview():
	data = request.json
	url = data.get("link", None)
	if not url:
		return jsonify({"error": "No link provided"}), 404
	print(url)
	preview = link_preview(url)
	print(preview)
	return jsonify({
		"title": preview.title,
		"description": preview.description,
		"image": preview.image,
	}), 200

@authRoutes.route("/upload/files", methods=["POST"])
@token_required
def upload_files():
	print("FILES:", request.files)
	print("FORM:", request.form)
	if 'files' not in request.files:
		print(request.files)
		return jsonify({"message": "No files provided"}), 404
	
	files = request.files.getlist('files')
	file_types = request.form.getlist('fileTypes[]')
	
	if len(files) == 0:
		print(request.files)
		return jsonify({"message": "Files not provided"}), 404
	
	UPLOAD_FOLDER = "D:/Skills_Practice/Conversations/backend/uploads"
	os.makedirs(UPLOAD_FOLDER, exist_ok=True)
	
	saved_files = []
	
	for idx, file in enumerate(files):
		try:
			original_filename = secure_filename(file.filename)
			file_type = file_types[idx] if idx < len(file_types) else "unknown"
			file_extension = os.path.splitext(original_filename)[1].lower()
			unique_filename = f"{uuid.uuid4()}{file_extension}"
			file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
			
			if file_type == "image" and file_extension in ['.jpg', '.jpeg', '.png', '.webp']:
				compressed_path = compress_image(file, file_path, file_extension)
				file_size = os.path.getsize(compressed_path)
			elif file_extension == '.pdf':
				compressed_path = compress_pdf(file, file_path)
				file_size = os.path.getsize(compressed_path)
			else:
				file.save(file_path)
				file_size = os.path.getsize(file_path)
			
			saved_files.append({
				"original_name": original_filename,
				"saved_name": unique_filename,
				"path": file_path,
				"type": file_type,
				"size": file_size,
				"url": f"/uploads/{unique_filename}"
			})
			
		except Exception as e:
			print(f"Error saving file {file.filename}: {str(e)}")
			continue
	
	return jsonify({
		"message": "Files uploaded successfully",
		"files": saved_files,
		"count": len(saved_files)
	}), 200


def compress_image(file, output_path, file_extension):
	"""Compress images while maintaining quality"""
	try:
		img = Image.open(file)
		
		if img.mode == 'RGBA' and file_extension in ['.jpg', '.jpeg']:
			img = img.convert('RGB')
		
		max_width = 1920
		if img.width > max_width:
			ratio = max_width / img.width
			new_height = int(img.height * ratio)
			img = img.resize((max_width, new_height), Image.LANCZOS)
		
		if file_extension in ['.jpg', '.jpeg']:
			img.save(output_path, 'JPEG', quality=85, optimize=True)
		elif file_extension == '.png':
			img.save(output_path, 'PNG', optimize=True, compress_level=6)
		elif file_extension == '.webp':
			img.save(output_path, 'WEBP', quality=85, method=6)
		else:
			img.save(output_path)
		
		return output_path
	except Exception as e:
		print(f"Error compressing image: {str(e)}")
		file.save(output_path)
		return output_path


def compress_pdf(file, output_path):
	"""Compress PDF files"""
	try:
		from PyPDF2 import PdfReader, PdfWriter
		
		reader = PdfReader(file)
		writer = PdfWriter()
		
		for page in reader.pages:
			page.compress_content_streams()
			writer.add_page(page)
		
		with open(output_path, 'wb') as output_file:
			writer.write(output_file)
		
		return output_path
	except Exception as e:
		print(f"Error compressing PDF: {str(e)}")
		file.save(output_path)
		return output_path