"""
Analyze Note App - Token-Efficient Version
Returns only summary stats, not full data
"""
import os
import json

def analyze_project():
    results = {
        "backend_files": 0,
        "frontend_files": 0,
        "total_rust_lines": 0,
        "total_tsx_lines": 0,
        "recent_changes": []
    }
    
    # Count backend files
    backend_path = "C:/dev/note-app/backend/src"
    if os.path.exists(backend_path):
        for root, dirs, files in os.walk(backend_path):
            for file in files:
                if file.endswith('.rs'):
                    results["backend_files"] += 1
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        results["total_rust_lines"] += len(f.readlines())
    
    # Count frontend files
    frontend_path = "C:/dev/note-app/frontend/src"
    if os.path.exists(frontend_path):
        for root, dirs, files in os.walk(frontend_path):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    results["frontend_files"] += 1
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        results["total_tsx_lines"] += len(f.readlines())
    
    return results

if __name__ == "__main__":
    stats = analyze_project()
    print(json.dumps(stats, indent=2))
