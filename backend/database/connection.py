from pymongo import MongoClient
from config import Config

class Database:
    """Singleton database connection"""
    _instance = None
    db = None
    active_users = []
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize database connection"""
        print("Connecting to MongoDB...")
        client = MongoClient(Config.MONGODB_URI)
        self.db = client["MAXAI"]
        print(f"Connected to database: {self.db.name}")
    
    def get_collection(self, name):
        """Get a collection by name"""
        return self.db[name]


db_instance = Database()