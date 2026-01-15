from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from datetime import datetime, timezone
from bson import ObjectId

from models.message import MessageModel
from middleware.auth import token_required
from utils.encryption import encryption_service

messages_bp = Blueprint("messages", __name__)
message_model = MessageModel()


@messages_bp.route("/get/messages", methods=["POST"])
@token_required
def get_messages():
    """Get messages between two users"""
    user_data = request.user
    data = request.json
    
    sender_id = user_data.get("_id")
    receiver_id = data.get("receiver_id")
    
    if not sender_id or not receiver_id:
        return jsonify({"message": "Sender or Receiver ID missing!"}), 400
    
    messages = message_model.get_messages(str(sender_id), receiver_id)
    
    output = []
    for msg in messages:
        decrypted_text = encryption_service.decrypt(msg["text"])
        
        output.append({
            "id": str(msg.get("id", "")),
            "text": decrypted_text,
            "sender_id": str(msg.get("sender_id", "")),
            "receiver_id": str(msg.get("receiver_id", "")),
            "timestamp": str(msg.get("timestamp", "")),
            "reply": msg.get("reply"),
            "sending_time": msg.get("sending_time", "")
        })
    
    return jsonify({"messages": output}), 200



@messages_bp.route("/send/message", methods=["POST"])
@token_required
def send_message():
    """Send a message"""
    try:
        print("\n" + "=" * 80)
        print("SEND MESSAGE ENDPOINT HIT")
        print("=" * 80)
        
        user_data = request.user
        data = request.json
        
        print(f"User data: {user_data.get('_id')}")
        print(f"Request data: {data}")
        
        sender_id = user_data.get("_id")
        receiver_id = data.get("receiver_id")
        text = data.get("text", "")
        
        if not sender_id or not receiver_id:
            print("Missing sender or receiver ID")
            return jsonify({"message": "Message cannot be saved!"}), 400
        
        print("Encrypting message...")
        encrypted_text = encryption_service.encrypt(text)
        print("Message encrypted successfully")
        
        print("Saving message to database...")
        message_doc = message_model.save_message(
            sender_id=str(sender_id),
            receiver_id=receiver_id,
            encrypted_text=encrypted_text,
            reply=data.get("replying_data"),
            id=data.get("revised_id"),
            sending_time=data.get("sending_time", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )
        print("Message saved to database")
        
        # Emit to receiver if online
        print("Checking for active users...")
        from database.connection import db_instance
        from web_sockets import get_socketio
        
        socketio = get_socketio()
        print(f"Socketio instance: {socketio}")
        print(f"Active users: {db_instance.active_users}")
        
        active_user = next(
            (u for u in db_instance.active_users if u['user_id'] == receiver_id),
            None
        )
        
        print(f"Active user found: {active_user}")
        
        if active_user and socketio:
            print("Emitting message to active user...")
            socketio.emit(
                "receive_message",
                {
                    "sender_id": str(sender_id),
                    "receiver_id": receiver_id,
                    "text": text,
                    "reply": data.get("replying_data"),
                    "id": data.get("revised_id"),
                    "timestamp": str(message_doc["timestamp"]),
                    "sending_time": message_doc["sending_time"]
                },
                to=active_user['sid']
            )
            print("Message emitted successfully")
        else:
            print("Receiver not online or socketio not available")
        
        print("Sending success response")
        print("=" * 80 + "\n")
        return jsonify({"message": "saved successfully"}), 200
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("ERROR IN SEND_MESSAGE:")
        print(str(e))
        import traceback
        traceback.print_exc()
        print("=" * 80 + "\n")
        return jsonify({"error": str(e), "message": "Error sending message"}), 500
