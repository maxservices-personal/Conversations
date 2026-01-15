from flask import request
from flask_socketio import emit
from datetime import datetime

from database.connection import db_instance
from models.user import UserModel
from models.message import MessageModel

user_model = UserModel()
message_model = MessageModel()
socketio = None

def handle_join(data):
    """Handle user joining"""
    user_id = data.get('_id', 'Anonymous')
    data_to_add = {'user_id': user_id, 'sid': request.sid}
    
    if user_id not in [user['user_id'] for user in db_instance.active_users]:
        user_model.update_last_seen(user_id, None)
        db_instance.active_users.append(data_to_add)
    
    print(f'{user_id} joined. Active users: {len(db_instance.active_users)}')
    emit("active_users", {"active_users": db_instance.active_users}, broadcast=True)


def handle_disconnect():
    """Handle user disconnection"""
    disconnected_user = next(
        (user for user in db_instance.active_users if user["sid"] == request.sid),
        None
    )
    
    if disconnected_user:
        user_id = disconnected_user["user_id"]
        print(user_id)
        
        db_instance.active_users = [
            u for u in db_instance.active_users if u["sid"] != request.sid
        ]
        last_seen = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user_model.update_last_seen(
            user_id,
            last_seen
        )
        
        print(f"{user_id} went offline — last seen updated")
    
    emit(
        "active_users",
        {
            "active_users": db_instance.active_users
        },
        broadcast=True
    )

    emit(
        "last_seen_update",
        {
            "user_id": str(disconnected_user["user_id"]),
            "last_seen": last_seen  
        },
        broadcast=True
    )



def handle_typing(data):
    """Handle typing indicator"""
    from web_sockets import socketio_instance
    
    sender_id = data.get('senderId')
    receiver_id = data.get('receiverId')
    
    active_user = next(
        (user for user in db_instance.active_users if user["user_id"] == receiver_id),
        None
    )
    
    if active_user:
        socketio_instance.emit("typing", {'senderId': sender_id}, room=active_user["sid"])


def handle_stop_typing(data):
    """Handle stop typing indicator"""
    from web_sockets import socketio_instance
    
    sender_id = data.get('senderId')
    receiver_id = data.get('receiverId')
    
    active_user = next(
        (user for user in db_instance.active_users if user["user_id"] == receiver_id),
        None
    )
    
    if active_user:
        socketio_instance.emit("stopTyping", {'senderId': sender_id}, room=active_user["sid"])


def handle_delete_message(data):
    """Handle message deletion"""
    from web_sockets import socketio_instance
    
    message_id = data.get("message_id")
    friend_id = data.get("friend_id")
    
    try:
        success = message_model.delete_message(message_id)
        
        if not success:
            emit("error", {"msg": "Message not found"})
            return
        
        emit("message_deleted", {"message_id": message_id}, room=request.sid)
        
        active_user = next(
            (u for u in db_instance.active_users if u['user_id'] == friend_id),
            None
        )
        
        if active_user:
            emit("message_deleted", {"message_id": message_id}, to=active_user['sid'])
        
    except Exception as e:
        print("Error deleting message:", e)
        emit("error", {"msg": str(e)})


def register_socketio_events(socketio1):
    """Register all Socket.IO event handlers"""
    global socketio
    socketio = socketio1
    socketio.on_event('join', handle_join)
    socketio.on_event('disconnect', handle_disconnect)
    socketio.on_event('typing', handle_typing)
    socketio.on_event('stopTyping', handle_stop_typing)
    socketio.on_event('delete_message', handle_delete_message)