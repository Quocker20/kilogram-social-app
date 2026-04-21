import pandas as pd
import numpy as np
import datetime
from sklearn.decomposition import TruncatedSVD
from sqlalchemy.orm import Session
from database import engine

# In-memory storage for the trained matrices
model_data = {
    "user_factors": None,
    "item_factors": None,
    "user_index": None,
    "post_index": None,
    "is_trained": False
}

def load_data(db_engine):
    # Fetch user interactions
    query_interactions = """
    SELECT user_id, post_id, interaction_type 
    FROM user_interactions 
    """
    df_interactions = pd.read_sql(query_interactions, db_engine)
    
    # Calculate implicit feedback score
    def get_score(row):
        if row['interaction_type'] == 'COMMENT':
            return 5
        elif row['interaction_type'] == 'DELETE_COMMENT':
            return -5
        elif row['interaction_type'] == 'LIKE':
            return 3
        elif row['interaction_type'] == 'UNLIKE':
            return -3
        return 0
    
    if not df_interactions.empty:
        df_interactions['score'] = df_interactions.apply(get_score, axis=1)
        # Sum scores to handle multiple interactions (e.g., LIKE then UNLIKE)
        df_grouped = df_interactions.groupby(['user_id', 'post_id'])['score'].sum().reset_index()
        # Filter out posts with net score <= 0 (meaning interaction was reverted)
        df_grouped = df_grouped[df_grouped['score'] > 0]
    else:
        df_grouped = pd.DataFrame(columns=['user_id', 'post_id', 'score'])
        
    return df_grouped

def train_model():
    global model_data
    print("Starting ML Model Training...")
    
    df = load_data(engine)
    
    if df.empty or len(df['user_id'].unique()) < 2 or len(df['post_id'].unique()) < 2:
        print("Not enough data to train SVD model. Fallback to Trending only.")
        model_data["is_trained"] = False
        return

    # Create User-Item Matrix
    user_item_matrix = df.pivot(index='user_id', columns='post_id', values='score').fillna(0)
    
    n_users = user_item_matrix.shape[0]
    n_items = user_item_matrix.shape[1]
    
    # Determine safe n_components
    n_comp = min(20, min(n_users, n_items) - 1)
    
    if n_comp < 1:
        print("Not enough dimensions for SVD. Fallback to Trending only.")
        model_data["is_trained"] = False
        return
        
    svd = TruncatedSVD(n_components=n_comp, random_state=42)
    user_factors = svd.fit_transform(user_item_matrix)
    item_factors = svd.components_
    
    # Update global model data safely
    model_data["user_factors"] = user_factors
    model_data["item_factors"] = item_factors
    model_data["user_index"] = {user_id: idx for idx, user_id in enumerate(user_item_matrix.index)}
    model_data["post_index"] = {post_id: idx for idx, post_id in enumerate(user_item_matrix.columns)}
    model_data["is_trained"] = True
    
    print(f"Model trained successfully. Users: {n_users}, Posts: {n_items}, Components: {n_comp}")


def calculate_trending_score(like_count, comment_count, created_at, gravity=1.8):
    # Calculate age in hours
    now = datetime.datetime.utcnow()
    age_td = now - created_at
    age_hours = age_td.total_seconds() / 3600.0
    
    # Handle future dates or timezone differences smoothly
    if age_hours < 0:
        age_hours = 0
        
    score = (like_count + (comment_count * 2.0) - 1.0) / ((age_hours + 2.0) ** gravity)
    return score

def min_max_scale(arr):
    if len(arr) == 0:
        return arr
    min_val = np.min(arr)
    max_val = np.max(arr)
    if min_val == max_val:
        return np.ones(len(arr)) if max_val > 0 else np.zeros(len(arr))
    return (arr - min_val) / (max_val - min_val)

def get_recommendations(target_user_id: str, candidates: list, limit: int = 20):
    if not candidates:
        return []
        
    candidate_ids = [c.id for c in candidates]
    
    # 1. Calc Trending Scores
    t_scores = np.array([calculate_trending_score(c.like_count, c.comment_count, c.created_at) for c in candidates])
    t_scores_scaled = min_max_scale(t_scores)
    
    # 2. Calc CF Scores
    cf_scores_scaled = np.zeros(len(candidates))
    alpha = 0.8 # Default: 80% Trending, 20% Personalize
    
    if model_data["is_trained"] and target_user_id in model_data["user_index"]:
        user_idx = model_data["user_index"][target_user_id]
        u_vector = model_data["user_factors"][user_idx]
        
        cf_raw = np.zeros(len(candidates))
        for i, c_id in enumerate(candidate_ids):
            if c_id in model_data["post_index"]:
                item_idx = model_data["post_index"][c_id]
                i_vector = model_data["item_factors"][:, item_idx]
                cf_raw[i] = np.dot(u_vector, i_vector)
                
        cf_scores_scaled = min_max_scale(cf_raw)
    else:
        # Cold start for this user
        alpha = 1.0 # 100% Trending if we don't know the user
    
    # 3. Mix Ranking
    final_scores = (1 - alpha) * cf_scores_scaled + alpha * t_scores_scaled
    
    # 4. Sort and return top K
    sorted_indices = np.argsort(final_scores)[::-1] # Descending order
    top_indices = sorted_indices[:limit]
    
    result = [candidate_ids[i] for i in top_indices]
    return result
