from flask import Blueprint, jsonify, request

from models.notification import NotificationModel
from middleware.auth import token_required

notifications_bp = Blueprint("notifications", __name__)
notification_model = NotificationModel()


@notifications_bp.route("/get/notifications", methods=["POST"])
@token_required
def get_notifications():
    """Get all notifications for a user"""
    user_data = request.user
    notifications = notification_model.get_notifications(user_data["_id"])
    return jsonify({"notifications": notifications})
