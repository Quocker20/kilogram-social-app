from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    is_active = Column(Boolean, default=True)

class Post(Base):
    __tablename__ = "posts"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    created_at = Column(DateTime)

class Follow(Base):
    __tablename__ = "follows"
    follower_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    following_id = Column(String(36), ForeignKey("users.id"), primary_key=True)

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    post_id = Column(String(36), ForeignKey("posts.id"))
    interaction_type = Column(Enum('LIKE', 'UNLIKE', 'COMMENT', 'DELETE_COMMENT', 'VIEW'))
    created_at = Column(DateTime)
