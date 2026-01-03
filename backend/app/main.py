import asyncio
import time
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

# --- 1. DATA STORAGE ---
# Replace with your actual MongoDB connection string
client = AsyncIOMotorClient("your_mongodb_connection_string_here")
db = client.transactions_db
transactions_collection = db.transactions

# --- 2. SCHEMAS (MODELS) ---
class TransactionWebhook(BaseModel):
    transaction_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str

class TransactionResponse(BaseModel):
    transaction_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    processed_at: Optional[datetime] = None

# --- 3. BACKGROUND PROCESSING ---
async def process_transaction_task(transaction_id: str):
    # Requirement: 30-second delay to simulate external API calls 
    await asyncio.sleep(30) 
    await transactions_collection.update_one(
        {"transaction_id": transaction_id},
        {"$set": {"status": "PROCESSED", "processed_at": datetime.utcnow()}}
    )

# --- 4. API ENDPOINTS ---

@app.get("/")
async def health_check():
    # Requirement: Health check returning current time [cite: 40, 43, 44]
    return {
        "status": "HEALTHY",
        "current_time": datetime.utcnow().isoformat()
    }

@app.post("/v1/webhooks/transactions", status_code=status.HTTP_202_ACCEPTED)
async def handle_webhook(webhook: TransactionWebhook, background_tasks: BackgroundTasks):
    # Requirement: Idempotency - check if ID exists [cite: 73, 74]
    existing = await transactions_collection.find_one({"transaction_id": webhook.transaction_id})
    
    if not existing:
        new_txn = webhook.dict()
        new_txn.update({
            "status": "PROCESSING",
            "created_at": datetime.utcnow(),
            "processed_at": None
        })
        await transactions_collection.insert_one(new_txn) [cite: 72, 77]
        
        # Requirement: Process in background to keep response under 500ms [cite: 67, 69]
        background_tasks.add_task(process_transaction_task, webhook.transaction_id)
    
    return {"message": "Accepted"} [cite: 66, 68]

@app.get("/v1/transactions/{transaction_id}", response_model=List[TransactionResponse])
async def get_transaction(transaction_id: str):
    # Requirement: Retrieve transaction status for testing [cite: 47]
    cursor = transactions_collection.find({"transaction_id": transaction_id})
    txns = await cursor.to_list(length=10)
    if not txns:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txns