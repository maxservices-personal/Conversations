from bson import ObjectId

class NotificationModel:
    """Notification model for database operations"""
    
    def __init__(self):
        from database.connection import db_instance
        self.collection = db_instance.get_collection("notifications")
    
    def get_notifications(self, user_id):
        """Get all notifications for a user"""
        notification_box = self.collection.find_one({"connected_user_id": ObjectId(user_id)})
        if not notification_box:
            return []
        return notification_box.get("notifications", [])
    
    def add_notification(self, user_id, notification_type, from_user_id):
        """Add a notification"""
        notification = {
            "type": notification_type,
            "from": str(from_user_id)
        }
        
        notification_box = self.collection.find_one({"connected_user_id": ObjectId(user_id)})
        
        if notification_box:
            notifications = notification_box.get("notifications", [])
            notifications.append(notification)
            
            self.collection.update_one(
                {"connected_user_id": ObjectId(user_id)},
                {"$set": {"notifications": notifications}}
            )
        else:
            data = {
                "connected_user_id": ObjectId(user_id),
                "notifications": [notification]
            }
            self.collection.insert_one(data)
    
    def remove_notification(self, user_id, notification_type, from_user_id):
        """Remove a specific notification"""
        notification_box = self.collection.find_one({"connected_user_id": ObjectId(user_id)})
        
        if notification_box:
            notifications = notification_box.get("notifications", [])
            updated = [
                n for n in notifications 
                if not (n.get("type") == notification_type and n.get("from") == from_user_id)
            ]
            
            self.collection.update_one(
                {"connected_user_id": ObjectId(user_id)},
                {"$set": {"notifications": updated}}
            )
    
    def get_friend_requests(self, user_id):
        """Get friend requests for a user"""
        notifications = self.get_notifications(user_id)
        return [n for n in notifications if n.get("type") == "friend_req"]