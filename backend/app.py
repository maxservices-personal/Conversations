from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

from config import Config
from database.connection import db_instance
from routes.auth import auth_bp
from routes.friends import friends_bp
from routes.messages import messages_bp
from routes.notifications import notifications_bp
from web_sockets.events import register_socketio_events
import web_sockets


def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(
        app,
        resources={r"/*": {"origins": "*"}}, 
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Type"],
    )
    
    @app.errorhandler(Exception)
    def handle_error(error):
        """Handle all errors and ensure CORS headers are present"""
        import traceback
        print("=" * 80)
        print("ERROR OCCURRED:")
        print(traceback.format_exc())
        print("=" * 80)
        
        response = jsonify({
            "error": str(error),
            "message": "Internal server error"
        })
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors with CORS headers"""
        response = jsonify({
            "error": "Internal server error",
            "message": str(error)
        })
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(friends_bp, url_prefix="/api")
    app.register_blueprint(messages_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")
    
    socketio = SocketIO(
        app, 
        cors_allowed_origins="*",  
        async_mode='eventlet',
        logger=True,
        engineio_logger=False,
        ping_timeout=60,
        ping_interval=25
    )
    
    web_sockets.set_socketio(socketio)
    
    register_socketio_events(socketio)
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "ok", "message": "Server is running"}), 200
    
    return app, socketio

if __name__ == "__main__":
    app, socketio = create_app()
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)