from bson import ObjectId
from datetime import datetime, timezone

class MessageModel:
    """Message model for database operations"""
    
    def __init__(self):
        from database.connection import db_instance
        self.collection = db_instance.get_collection("chat_messages")
    
    def save_message(self, sender_id, receiver_id, encrypted_text, **kwargs):
        """Save a new message"""
        message_doc = {
            "sender_id": ObjectId(sender_id),
            "receiver_id": ObjectId(receiver_id),
            "text": encrypted_text,
            "reply": kwargs.get("reply"),
            "id": kwargs.get("id"),
            "timestamp": kwargs.get("timestamp", datetime.now(timezone.utc)),
            "sending_time": kwargs.get("sending_time")
        }
        
        self.collection.insert_one(message_doc)
        return message_doc
    
    def get_messages(self, user_id, friend_id):
        """Get messages between two users"""
        messages = list(self.collection.find({
            "$or": [
                {"sender_id": ObjectId(user_id), "receiver_id": ObjectId(friend_id)},
                {"sender_id": ObjectId(friend_id), "receiver_id": ObjectId(user_id)}
            ]
        }).sort("timestamp", 1))
        
        return messages
    
    def delete_message(self, message_id):
        """Delete a message by ID"""
        result = self.collection.delete_one({"id": message_id})
        return result.deleted_count > 0