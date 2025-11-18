#!/usr/bin/env python3
"""
Batch file editor - apply multiple edits in one operation
Reads a JSON file with edit instructions and applies them all
"""
import json
import sys
from pathlib import Path

def apply_edits(edits_file):
    with open(edits_file, 'r') as f:
        edits = json.load(f)
    
    results = []
    
    for edit in edits:
        file_path = edit['file']
        old_text = edit['old']
        new_text = edit['new']
        
        try:
            # Read file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if old_text exists
            if old_text not in content:
                results.append(f"❌ {file_path}: Text not found")
                continue
            
            # Replace
            new_content = content.replace(old_text, new_text)
            
            # Write back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            results.append(f"✅ {file_path}: Edit applied")
            
        except Exception as e:
            results.append(f"❌ {file_path}: {str(e)}")
    
    # Print results
    print("\nBatch Edit Results:")
    print("=" * 80)
    for result in results:
        print(result)
    print(f"\n{len([r for r in results if '✅' in r])}/{len(results)} edits successful")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python batch-edit.py edits.json")
        sys.exit(1)
    
    apply_edits(sys.argv[1])
