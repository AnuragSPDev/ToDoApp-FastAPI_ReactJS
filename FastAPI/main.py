from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Annotated, List, Optional
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
import models

app = FastAPI()

origin = [
    'https://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ToDoBase(BaseModel):
    title: Optional[str] = None  # To make this field optional
    desc: Optional[str] = None
    is_completed: bool

class ToDoModel(ToDoBase):
    id: int

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
models.Base.metadata.create_all(bind=engine)

@app.post('/task/', response_model=ToDoModel)
async def create_task(task: ToDoBase, db: db_dependency):
    db_task = models.ToDo(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get('/tasks/', response_model=List[ToDoModel])
async def get_tasks(db: db_dependency):
    result = db.query(models.ToDo).all()
    if not result:
        return HTTPException(status_code=404, detail='Tasks not found')
    return result

@app.put('/task/{task_id}', response_model=ToDoModel)
async def update_task(task_id: int, task: ToDoBase, db: db_dependency):
    db_task = db.query(models.ToDo).filter(models.ToDo.id==task_id).first()
    if not db_task:
        return HTTPException(status_code=404, detail='Task not found')
    # db_task.title = task.title
    # db_task.desc = task.desc
    if task.is_completed is not None:
        db_task.is_completed = task.is_completed
    db.commit()
    db.refresh(db_task)
    return db_task

# @app.delete('/delete_task/{task_id}/', response_model=ToDoModel)
@app.delete('/delete_task/{task_id}/')
async def delete_task(task_id: int, db: db_dependency):
    db_task = db.query(models.ToDo).filter(models.ToDo.id==task_id).first()
    if not db_task:
        return HTTPException(status_code=404, detail='Task not found')
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}
