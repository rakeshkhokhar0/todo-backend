from database_connection import databaseconnection as db
from schema import TaskCreate,TaskUpdate

# task creation 
def create_task(task : TaskCreate):
    with db() as cursor:
        cursor.execute("insert into todos(name,description) values(%s, %s) returning *",(task.name,task.description))
        return cursor.fetchone()


def get_all_task():
    with db() as cursor:
        cursor.execute(
            """
            select * from todos order by id desc
            """
        )
        return cursor.fetchall()

def get_task(task_id:int):
    with db() as cursor:
        cursor.execute(
            """
            select * from todos where id = %s
            """,(task_id,)
        )
        return cursor.fetchone()
    
def update_task(task_id:int,task:TaskUpdate):
    with db() as cursor:
        cursor.execute(
            """
            update todos
            set 
            name = coalesce(%s,name),
            description = coalesce(%s,description)
            where id = %s
            returning *
            """,(task.name,task.description,task_id)
        )
        return cursor.fetchone()


def delete_task(task_id:int):
    with db() as cursor:
        cursor.execute(
            """
            delete from todos where id = %s
            returning name
            """,(task_id,)
        )
        return cursor.fetchone()


def complete_task(task_id:int):
    with db() as cursor:
        cursor.execute(
            """
            update todos set is_completed = true where id = %s
            returning *
            """,(task_id,)
        )
        return cursor.fetchone()
    
def get_task_name_date():
    with db() as cursor:
        cursor.execute(
            """
            select name,created_at from todos
            """
        )
        return cursor.fetchall()

    
def get_active_task():
    with db() as cursor:
        cursor.execute(
            """
            select * from todos where is_completed = false order by id desc
            """
        )
        return cursor.fetchall()
    
def get_complete_task():
    with db() as cursor:
        cursor.execute(
            """
            select * from todos where is_completed = true order by id desc
            """
        )
        return cursor.fetchall()
