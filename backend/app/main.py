from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from datetime import datetime
from .database import transactions_collection
from .models import TransactionWebhook
from .worker import process_transaction_task

app = FastAPI()

@app.get("/")
async def health_check():
    """Health check endpoint[cite: 39, 40]."""
    return {
        "status": "HEALTHY",
        "current_time": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/v1/webhooks/transactions", status_code=status.HTTP_202_ACCEPTED)
async def handle_webhook(payload: TransactionWebhook, background_tasks: BackgroundTasks):
    """
    Receives webhooks and acknowledges within 500ms[cite: 66, 67].
    Handles idempotency[cite: 73, 74, 75].
    """
    # Idempotency: Check if transaction exists [cite: 74]
    existing = await transactions_collection.find_one({"transaction_id": payload.transaction_id})
    if existing:
        return {"message": "Accepted"} # Return 202 without re-processing [cite: 75]

    # Store initial processing state [cite: 77]
    txn_data = payload.dict()
    txn_data.update({
        "status": "PROCESSING",
        "created_at": datetime.utcnow(),
        "processed_at": None
    })
    await transactions_collection.insert_one(txn_data)

    # Trigger background task [cite: 69, 70]
    background_tasks.add_task(process_transaction_task, payload.transaction_id)

    return {"message": "Accepted"}

@app.get("/v1/transactions/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Retrieves transaction status for testing[cite: 46, 47]."""
    txn = await transactions_collection.find_one({"transaction_id": transaction_id}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Must return as a list [cite: 49, 58]
    return [txn]