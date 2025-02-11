from sqlalchemy import String, Boolean, Column, Integer
from database import Base

class ToDo(Base):
    __tablename__ = 'todo'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    desc = Column(String, index=True)
    is_completed = Column(Boolean, default=False)
    