from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    name : str
    description : Optional[str] = None

class TaskResponse(BaseModel):
    id : int
    name : str
    description : Optional[str] = None
    is_completed : bool
    created_at : datetime

class TaskUpdate(BaseModel):
    name : Optional[str] = None
    description : Optional[str] = None