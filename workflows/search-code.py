#!/usr/bin/env python3
"""
Smart code search - finds patterns and returns structured results
Token-efficient: Returns matches with context, not full files
"""

import sys
import os
import re
from pathlib import Path

def search_code(pattern, directory, file_extensions=None, context_lines=2):
    """Search for pattern in code files with context"""
    if file_extensions is None:
        file_extensions = ['rs', 'ts', 'tsx', 'js', 'jsx', 'py']
    
    results = []
    search_regex = re.compile(pattern, re.IGNORECASE)
    
    # Find all relevant files
    for ext in file_extensions:
        for filepath in Path(directory).rglob(f'*.{ext}'):
            # Skip node_modules, build dirs, etc
            if any(skip in str(filepath) for skip in ['node_modules', '.next', 'target', '__pycache__']):
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                for i, line in enumerate(lines):
                    if search_regex.search(line):
                        # Get context
                        start = max(0, i - context_lines)
                        end = min(len(lines), i + context_lines + 1)
                        context = ''.join(lines[start:end])
                        
                        results.append({
                            'file': os.path.relpath(filepath, start=directory),
                            'line': i + 1,
                            'match': line.strip(),
                            'context': context
                        })
            except Exception:
                continue
    
    return results

def print_results(results, pattern):
    """Print search results in readable format"""
    if not results:
        print(f"❌ No matches found for: {pattern}")
        return
    
    print(f"\n🔍 SEARCH RESULTS for '{pattern}'")
    print(f"{'='*60}")
    print(f"Found {len(results)} matches\n")
    
    # Group by file
    by_file = {}
    for result in results:
        if result['file'] not in by_file:
            by_file[result['file']] = []
        by_file[result['file']].append(result)
    
    # Print grouped results
    for filepath, matches in sorted(by_file.items()):
        print(f"\n📁 {filepath} ({len(matches)} matches)")
        for match in matches[:3]:  # Show first 3 matches per file
            print(f"\n  Line {match['line']}: {match['match']}")
        
        if len(matches) > 3:
            print(f"  ... and {len(matches) - 3} more matches")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python search-code.py <pattern> [directory] [extensions]")
        print("Examples:")
        print("  python search-code.py 'create_note' ./backend")
        print("  python search-code.py 'useState' ./frontend rs,ts,tsx")
        sys.exit(1)
    
    pattern = sys.argv[1]
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    extensions = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    
    results = search_code(pattern, directory, extensions)
    print_results(results, pattern)
