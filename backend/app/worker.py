import asyncio
from datetime import datetime
from .database import transactions_collection

async def process_transaction_task(transaction_id: str):
    """
    Simulates external API calls with a 30-second delay[cite: 71].
    Updates persistent storage upon completion[cite: 72, 77].
    """
    await asyncio.sleep(30) 
    
    await transactions_collection.update_one(
        {"transaction_id": transaction_id},
        {
            "$set": {
                "status": "PROCESSED",
                "processed_at": datetime.utcnow()
            }
        }
    )