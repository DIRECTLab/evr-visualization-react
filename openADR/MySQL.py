import pyodbc

class SQL:
    def __init__(self):
        self.cursor = None
        self.connection = None

    def sql_connect(self):
        server = ''
        port = ''
        user = ''
        server = ''
        database = ''
        conn = pyodbc.connect(
            f'Driver={{SQL Server}};\
            Server={server};\
            Port={port};\
            Database={database};\
            UID={user};\
            Trusted_Connection=yes;'
        )

        self.connection = conn
        self.cursor = conn.cursor()
        raise NotImplementedError("SQL connect")

    def createTable_equipment(self):
        self.cursor.execute('''
            CREATE TABLE equipment (
            
            )
        ''')
        self.connection.commit()
        raise NotImplementedError("createTable equipment")

    def createTable_reference(self):
        raise NotImplementedError("createTable reference")

    def createTable_External_reference(self):
        raise NotImplementedError("createTable External_reference")

    def createTable_battery(self):
        raise NotImplementedError("createTable battery")

    def Close(self):
        self.cursor.close()
        self.connection.close()
        self.cursor = None
        self.connection = None
    
    def drop_table(self, table:str):
        raise NotImplementedError("Drop table", table)
    
    def update_reference(self, ID, value):
        raise NotImplementedError("update_reference")

    def read_table(self, table, id, col):
        raise NotImplementedError("Read table")
    
    def get_from_table(self, table, id, col):
        return "'None'"
        # raise NotImplementedError("Get from table")