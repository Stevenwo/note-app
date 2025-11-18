#!/usr/bin/env python3
"""
Quick note finder - searches notes database and returns matches
Usage: python find-notes.py "search term"
"""
import sys
import psycopg2
import json

def find_notes(search_term):
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="notes_db",
        user="postgres",
        password="postgres"
    )
    
    cursor = conn.cursor()
    
    # Search in title and content
    cursor.execute("""
        SELECT id, title, created_at, 
               LEFT(content, 200) as preview,
               notebook_id
        FROM notes 
        WHERE title ILIKE %s OR content ILIKE %s
        ORDER BY created_at DESC
        LIMIT 20
    """, (f"%{search_term}%", f"%{search_term}%"))
    
    results = cursor.fetchall()
    
    if results:
        print(f"\nFound {len(results)} notes matching '{search_term}':\n")
        for row in results:
            note_id, title, created, preview, notebook = row
            print(f"ID: {note_id}")
            print(f"Title: {title}")
            print(f"Created: {created}")
            print(f"Preview: {preview}...")
            print(f"Notebook: {notebook}")
            print("-" * 80)
    else:
        print(f"No notes found matching '{search_term}'")
    
    cursor.close()
    conn.close()
    
    return len(results)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find-notes.py 'search term'")
        sys.exit(1)
    
    search_term = " ".join(sys.argv[1:])
    find_notes(search_term)
