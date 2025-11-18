"""
Search Notes Database - Token-Efficient
Returns only matching note IDs and titles, not full content
"""
import psycopg2
import json
import sys

def search_notes(query, limit=10):
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="note_app",
            user="postgres",
            password="postgres"
        )
        cursor = conn.cursor()
        
        # Search in title and content
        cursor.execute("""
            SELECT id, title, LEFT(content, 100) as preview
            FROM notes
            WHERE title ILIKE %s OR content ILIKE %s
            LIMIT %s
        """, (f'%{query}%', f'%{query}%', limit))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row[0],
                "title": row[1],
                "preview": row[2] + "..."
            })
        
        cursor.close()
        conn.close()
        
        return {
            "query": query,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else ""
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result = search_notes(query, limit)
    print(json.dumps(result, indent=2))
