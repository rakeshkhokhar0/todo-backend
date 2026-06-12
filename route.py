from fastapi import APIRouter
from schema import TaskCreate,TaskUpdate,TaskResponse
import service

router = APIRouter()

@router.post("/create",response_model=TaskResponse)
def create_task(task : TaskCreate):
    return service.create_task(task)
    
@router.get("/",response_model=list[TaskResponse])
def get_tasks(completed : bool|None = None):
    return service.get_tasks(completed)

@router.get("/{task_id}",response_model=TaskResponse)
def get_task(task_id : int):
    return service.get_single_task(task_id)

@router.patch("/{task_id}",response_model=TaskResponse)
def update_task(task_id : int,task : TaskUpdate):
    return service.update_task(task_id,task)

@router.delete("/{task_id}")
def delete_task(task_id : int):
    return service.delete_task(task_id)

@router.patch("/{task_id}/complete",response_model=TaskResponse)
def complete_task(task_id : int):
    return service.complete_task(task_id)

