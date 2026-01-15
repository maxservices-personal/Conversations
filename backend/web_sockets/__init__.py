"""WebSocket module initialization"""

# Global socketio instance
socketio_instance = None


def set_socketio(sio):
    """Set the global socketio instance"""
    global socketio_instance
    socketio_instance = sio

def get_socketio():
    """Get the global socketio instance"""
    return socketio_instance