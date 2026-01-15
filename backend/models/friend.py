from bson import ObjectId

class FriendModel:
    """Friend model for database operations"""
    
    def __init__(self):
        from database.connection import db_instance
        self.collection = db_instance.get_collection("friends")
    
    def get_friend_list(self, user_id):
        """Get user's friend list"""
        friend_doc = self.collection.find_one({"connected_user_id": ObjectId(user_id)})
        if not friend_doc:
            return []
        return friend_doc.get("friends", [])
    
    def add_friend(self, user_id, friend_id):
        """Add a friend to user's friend list"""
        friend_list = self.collection.find_one({"connected_user_id": ObjectId(user_id)})
        
        if friend_list:
            friends = friend_list.get("friends", [])
            friends.append({"user_id": ObjectId(friend_id)})
            
            self.collection.update_one(
                {"connected_user_id": ObjectId(user_id)},
                {"$set": {"friends": friends}}
            )
        else:
            data = {
                "connected_user_id": ObjectId(user_id),
                "friends": [{"user_id": ObjectId(friend_id)}]
            }
            self.collection.insert_one(data)
        
        return True
