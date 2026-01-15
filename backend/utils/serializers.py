from bson import ObjectId
from datetime import datetime

def serialize_data(data):
    """Recursively serialize MongoDB data"""
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