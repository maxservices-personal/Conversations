# Connect to MongoDB
from pymongo import MongoClient
from dotenv import load_dotenv; load_dotenv();
import os

def connect():
    print("Connecting")
    client = MongoClient(os.getenv("MONGODB_URI"))
    print("DB connected named ", client["MAXAI"])
    db = client["MAXAI"]
    DataBase.db = db
    return db


class DataBase:
    db = None
    active_users = []