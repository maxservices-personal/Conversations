from flask import Blueprint, jsonify, request
from bson import ObjectId

from models.user import UserModel
from models.friend import FriendModel
from models.notification import NotificationModel
from middleware.auth import token_required
from utils.serializers import serialize_data

friends_bp = Blueprint("friends", __name__)
user_model = UserModel()
friend_model = FriendModel()
notification_model = NotificationModel()


@friends_bp.route("/get/friends", methods=["POST"])
@token_required
def get_friends():
    """Get user's friend list"""
    user_data = request.user
    
    friend_list = friend_model.get_friend_list(user_data["_id"])
    
    if not friend_list:
        return jsonify({"friend_list": []})
    
    friend_ids = [f.get("user_id") for f in friend_list if f.get("user_id")]
    
    if not friend_ids:
        return jsonify({"friend_list": []})
    
    from database.connection import db_instance
    users_collection = db_instance.get_collection("users2")
    friends = list(users_collection.find({"_id": {"$in": friend_ids}}, {"password": 0}))
    
    friends = [serialize_data(friend) for friend in friends]
    
    return jsonify({"friend_list": friends})


@friends_bp.route("/get/friend_requests", methods=['POST'])
@token_required
def get_friend_requests():
    """Get pending friend requests"""
    user_data = request.user
    
    friend_requests = notification_model.get_friend_requests(user_data["_id"])
    
    if not friend_requests:
        return jsonify({"data": []})
    
    friend_ids = [ObjectId(req["from"]) for req in friend_requests]
    
    from database.connection import db_instance
    users_collection = db_instance.get_collection("users2")
    users = list(users_collection.find({"_id": {"$in": friend_ids}}, {"password": 0}))
    
    users = [serialize_data(user) for user in users]
    
    return jsonify({"data": users})


@friends_bp.route("/add/friends", methods=["POST"])
@token_required
def add_friend():
    """Send friend request"""
    user_data = request.user
    data = request.json
    friend_id = data.get("friend_id")
    
    if not friend_id:
        return jsonify({"message": "Friend ID is required"}), 400
    
    friend = user_model.find_by_id(friend_id)
    
    if not friend:
        return jsonify({"message": "Friend not found"}), 404
    
    friend_model.add_friend(str(user_data["_id"]), friend_id)
    notification_model.add_notification(friend_id, "friend_req", user_data["_id"])
    
    from database.connection import db_instance
    from web_sockets.events import socketio
    
    active_friend = next(
        (user for user in db_instance.active_users if user["user_id"] == friend_id),
        None
    )
    
    if active_friend:
        socketio.emit(
            "add_notification",
            {"notification": {"type": "friend_req", "from": str(user_data["_id"])}},
            to=active_friend["sid"]
        )
    
    friend_list = friend_model.get_friend_list(user_data["_id"])
    
    return jsonify({"friend_users": friend_list})


@friends_bp.route("/friend-request", methods=["POST"])
@token_required
def handle_friend_request():
    """Accept or reject friend request"""
    user_data = request.user
    data = request.json
    decision = data.get("selection")
    requester_id = data.get("requester_id")
    
    if requester_id is None:
        return jsonify({"message": "Friend ID not provided"}), 400
    
    if decision is None:
        return jsonify({"message": "Decision not provided"}), 400
    
    notification_model.remove_notification(
        str(user_data["_id"]),
        "friend_req",
        requester_id
    )
    
    if decision:
        friend_model.add_friend(str(user_data["_id"]), requester_id)
        friend_list = friend_model.get_friend_list(user_data["_id"])
        
        return jsonify({
            "message": "Friend request accepted",
            "new_friend_list": friend_list
        })
    
    return jsonify({"message": "Friend request rejected"})
