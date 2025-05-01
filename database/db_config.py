# db_config.py
import psycopg
import os
from dotenv import load_dotenv

DATABASE_URL = os.getenv.DATABASE_URL

def get_connection():

    return psycopg.connect(DATABASE_URL)