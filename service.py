import database
from fastapi import HTTPException
from schema import TaskCreate,TaskUpdate
from datetime import date



def create_task(task:TaskCreate):
    existing_tasks = database.get_task_name_date()

    for exist_task in existing_tasks:
        if exist_task["name"] == task.name:
            if exist_task["created_at"].date() == date.today():
                raise HTTPException(status_code=409,detail="Task cannot created. Try with another name")
            
    return database.create_task(task)

def get_tasks(completed):
    if completed is None:
        return database.get_all_task()
    elif completed:
        return database.get_active_task()
    else:
        return database.get_complete_task()


def get_single_task(task_id:int):
    existing_task = database.get_task(task_id)

    if not existing_task:
        raise HTTPException(status_code=404,detail="Task not found")
    
    return existing_task

def update_task(task_id:int,task:TaskUpdate):
    existing_task = database.get_task(task_id)

    if not existing_task:
        raise HTTPException(status_code=404,detail="Task not found")
    
    return database.update_task(task_id,task)


def delete_task(task_id:int):
    existing_task = database.get_task(task_id)

    if not existing_task:
        raise HTTPException(status_code=404,detail="Task not found")
    
    return database.delete_task(task_id)

def complete_task(task_id:int):
    existing_task = database.get_task(task_id)

    if not existing_task:
        raise HTTPException(status_code=404,detail="Task not found")
    
    if existing_task["is_completed"]:
        raise HTTPException(status_code=409,detail="Task already completed")

    return database.complete_task(task_id)



