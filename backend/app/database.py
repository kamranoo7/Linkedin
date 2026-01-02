import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Use MongoDB Atlas URI in production
MONGO_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.webhook_db
transactions_collection = db.transactions