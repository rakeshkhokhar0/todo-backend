import psycopg2
from psycopg2.extras import RealDictCursor


class databaseconnection:
    def __init__(self):
        self.conn = None

    def __enter__(self):
        self.conn = psycopg2.connect(
            host = "localhost",
            database = "todo",
            user = "postgres",
            password = "khokhar",
            port = "5432"
        )
        return self.conn.cursor(cursor_factory=RealDictCursor)
    
    def __exit__(self,exc_type,exc_val,exc_tb):

        if exc_type or exc_val or exc_tb:
            self.conn.close()
        else:
            self.conn.commit()
            self.conn.close()
            