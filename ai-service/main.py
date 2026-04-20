from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from apscheduler.schedulers.background import BackgroundScheduler
import uvicorn
from contextlib import asynccontextmanager

from database import engine, SessionLocal
import models
import ml_pipeline


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Setup APScheduler
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # App Startup
    print("Startup: Running initial ML Training...")
    ml_pipeline.train_model()
    
    # Start Scheduler
    scheduler.add_job(ml_pipeline.train_model, 'interval', minutes=60)
    scheduler.start()
    print("Scheduler started. Training every 60 mins.")
    
    yield
    
    # App Shutdown
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

@app.get("/api/v1/recommend/explore")
def recommend_explore(user_id: str, limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    """
    Returns a list of post_ids recommended for the user.
    """
    # 1. Candidate Selection (Bottleneck)
    # Fetch 1000 latest active posts
    # Exclude posts from users the target_user follows
    # Exclude posts the target_user has already interacted with (Like/Comment)
    
    query = text("""
        SELECT p.id, p.like_count, p.comment_count, p.created_at
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE u.is_active = True
          AND p.user_id != :user_id
          AND p.user_id NOT IN (
              SELECT following_id FROM follows WHERE follower_id = :user_id
          )
          AND p.id NOT IN (
              SELECT post_id FROM user_interactions 
              WHERE user_id = :user_id AND interaction_type IN ('LIKE', 'COMMENT')
          )
        ORDER BY p.created_at DESC
        LIMIT 1000
    """)
    
    result = db.execute(query, {"user_id": user_id}).fetchall()
    
    class P:
        def __init__(self, r):
            self.id = r[0]
            self.like_count = r[1]
            self.comment_count = r[2]
            self.created_at = r[3]
            
    candidates = [P(r) for r in result]
    
    if not candidates:
        return {"postIds": []}
    
    # 2. Get recommendations via ML + Trending Mix
    recommended_ids = ml_pipeline.get_recommendations(user_id, candidates, limit)
    
    return {"postIds": recommended_ids}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
