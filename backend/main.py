import time
from bson import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS  
# from DATABASE.connect import connect
from routes.auth import authRoutes, token_required, f
from flask_socketio import SocketIO, emit
# from routes.chats import chatsRoutes
from connect import DataBase

app = Flask(__name__)
db = DataBase
collection = db.db["users2"]
friends_collection = db.db["friends"]
notifications_collection = db.db["notifications"]
messages_collection = db.db["chat_messages"]
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.register_blueprint(authRoutes, url_prefix="/api/auth")
# app.register_blueprint(chatsRoutes, url_prefix="/api/chats")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")


@socketio.on('join')
def handle_join(data):
	user_id = data.get('_id', 'Anonymous')
	data_to_add = {'user_id': user_id, 'sid': request.sid}

	if user_id not in [user['user_id'] for user in DataBase.active_users]:
		collection.update_one({"_id": user_id}, {"$set": {"last_seen": None}})
		DataBase.active_users.append(data_to_add)

	print(f'{user_id} joined. Active users: {len(db.active_users)}')
	emit('active_users', DataBase.active_users, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user = next((user for user in DataBase.active_users if user["sid"] == request.sid), None)
    if disconnected_user:
        user_id = disconnected_user["user_id"]
        
        DataBase.active_users = [u for u in DataBase.active_users if u["sid"] != request.sid]
        
        collection.update_one(
            {"_id": user_id},
            {"$set": {"last_seen":  datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
        )

        print(f"{user_id} went offline — last seen updated")
    
    emit("active_users", DataBase.active_users, broadcast=True)

@socketio.on('typing')
def handle_typing(data):
	sender_id = data.get('senderId')
	receiver_id = data.get('receiverId')

	isActiveUser = next((user for user in DataBase.active_users if user["user_id"] == receiver_id), None)
	if isActiveUser:
		socketio.emit("typing", {'senderId': sender_id}, room=isActiveUser["sid"])

@socketio.on('stopTyping')
def handle_stop_typing(data):
	sender_id = data.get('senderId')
	receiver_id = data.get('receiverId')
	isActiveUser = next((user for user in DataBase.active_users if user["user_id"] == receiver_id), None)
	if isActiveUser:
		socketio.emit("stopTyping", {'senderId': sender_id}, room=isActiveUser["sid"])


@app.route("/api/add/friends", methods=["POST"])
@token_required
def add_friends():
	user_data = request.user
	data = request.json
	friend_id = data.get("friend_id")
	if not friend_id:
		print(friend_id)
		return jsonify({"message": "Friend ID is required"}), 400
	
	friend = collection.find_one({"_id": ObjectId(friend_id)})
	if not friend:
		return jsonify({"message": "Friend not found"}), 404
	friend["addedOneSide"] = True
	
	friend_list = friends_collection.find_one({"connected_user_id":user_data["_id"]})
	if friend_list:
		actual_friends_lists:list = friend_list['friends']
		actual_friends_lists.append({"user_id": friend["_id"]})
		friends_collection.update_one(
			{"connected_user_id": user_data["_id"]},
			{
				"$set": {
					"friends": actual_friends_lists
				}
			}
		)
	else:
		data_to_add = {
			"connected_user_id": user_data["_id"],
			"friends": [{"user_id": friend["_id"]}],
		}

		friends_collection.insert_one(data_to_add)
	print("Active Users:", db.active_users)
	print("Looking for friend:", friend["_id"])
	active_friend = next(
		(user for user in db.active_users if user["user_id"] == friend_id),
		None  # default if not found
	)
	print("Found active_friend:", active_friend)

	if active_friend:
		socketio.emit("add_notification", {"notification": {"type": "friend_req", "from": str(user_data["_id"]),}}, to=active_friend["sid"])
	
	notification_box = notifications_collection.find_one({"connected_user_id": friend["_id"]})
	if notification_box:
		notifications:list = notification_box["notifications"]
		notifications.append(
			{
				"type": "friend_req",
				"from": str(user_data["_id"])
			}
		)
		notifications_collection.update_one(
			{"connected_user_id": friend["_id"]},
			{"$set": {
				"notifications": notifications
			}}
		)
	if not notification_box:
		data_to_add = {
			"connected_user_id": friend["_id"],
			"notifications": [
				{
					"type": "friend_req",
					"from": str(user_data["_id"])
				}
			]
		}		
		notifications_collection.insert_one(data_to_add)
	friend_list = friends_collection.find_one({"connected_user_id":user_data["_id"]})
		
	return jsonify({"friend_users": friend_list})

@app.route("/api/friend-request", methods=["POST"])
@token_required
def accept_friend_request():
	user_data = request.user
	data = request.json
	decision  = data.get("selection", None)
	friend_requester_id = data.get("requester_id", None)

	if not friend_requester_id:
		return jsonify({"message": "friend id not provided"})
	
	if decision  == None:
		return jsonify({"message": "decision not provided"})
	
	notification_box = notifications_collection.find_one({"connected_user_id":user_data["_id"]})
	if notification_box:
		notifications = notification_box.get("notifications", [])

		updated_notifications = [
			n for n in notifications 
			if not (n.get("type") == "friend_req" and n.get("from") == friend_requester_id)
		]

		notifications_collection.update_one(
			{"connected_user_id": user_data["_id"]},
			{"$set": {"notifications": updated_notifications}}
		)

	if decision == True:
		friend = collection.find_one({"user_id": friend_requester_id})
		friend_list = friends_collection.find_one({"connected_user_id": user_data["_id"]})
		if friend_list:
			actual_friends_lists:list = friend_list['friends']
			actual_friends_lists.append({"user_id": friend["_id"]})
			friends_collection.update_one(
				{"connected_user_id": user_data["_id"]},
				{
					"$set": {
						"friends": actual_friends_lists
					}
				}
			)
		else:
			data_to_add = {
				"connected_user_id": user_data["_id"],
				"friends": [{"user_id": friend["_id"]}],
			}

			friends_collection.insert_one(data_to_add)
		friend_list = friends_collection.find_one({"connected_user_id": user_data["_id"]})
		
		return jsonify({"message": "Friend requested accepted", "new_friend_list":friend_list })

	if decision == False:
		return jsonify({"message": "rejected"})


import datetime

@app.route("/api/send/message", methods=["POST"])
@token_required
def send_message():
	user_data = request.user
	data = request.json
	sender_id = user_data.get("_id", None)
	sending_time = data.get("sending_time", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
	print(sending_time)
	timestamp = datetime.datetime.now(datetime.timezone.utc)
	revised_id = data.get("revised_id", None)
	receiver_id = data.get("receiver_id", None)
	text = data.get("text", "")
	replying_data = data.get("replying_data", None)
	print(replying_data)
	if sender_id is None or receiver_id is None:
		return jsonify({"message": "Message cannot be saved!"}), 400

	encrypted_text = f.encrypt(text.encode())

	message_doc = {
		"sender_id": ObjectId(sender_id),
		"receiver_id": ObjectId(receiver_id),
		"text": encrypted_text,
		"reply": replying_data,
		"id": revised_id,
		"timestamp": timestamp,
		"sending_time": sending_time,
	}

	msgg = messages_collection.insert_one(message_doc)
	active_user = next((u for u in DataBase.active_users if u['user_id'] == receiver_id), None)
	if active_user:
		socketio.emit(
			"receive_message",
			{
				"sender_id": str(sender_id),
				"receiver_id": str(receiver_id),
				"text": text,  
				"reply": replying_data,
				"id": revised_id,
				"timestamp": str(message_doc["timestamp"]),
				"sending_time": sending_time,
			},
			to=active_user['sid']
		)

	return jsonify({"message": "saved successfully"}), 200


@socketio.on("delete_message")
def handle_delete_message(data):
	message_id = data.get("message_id")
	friend_id = data.get("friend_id")  

	try:
		result = messages_collection.delete_one({"id": message_id})
		if not result:
			emit("error", {"msg": "Message not found"})
			return
		
		print(request.sid)

		emit("message_deleted", {"message_id": message_id}, room=request.sid)
		active_user = next((u for u in DataBase.active_users if u['user_id'] == friend_id), None)
		if active_user:
			emit("message_deleted", {"message_id": message_id}, to=active_user['sid'])

	except Exception as e:
		print("Error deleting message:", e)
		emit("error", {"msg": str(e)})


if __name__ == "__main__":
	socketio.run(app, host='0.0.0.0', port=5001, debug=True)
