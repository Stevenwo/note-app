#!/usr/bin/env python3
"""
Smart code analyzer - processes Rust files and returns structured summary
Token-efficient: Returns only key findings, not full file contents
"""

import sys
import os
from pathlib import Path
import re

def analyze_rust_file(filepath):
    """Analyze a Rust file and return structured summary"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract key information
        structs = re.findall(r'struct\s+(\w+)', content)
        functions = re.findall(r'fn\s+(\w+)', content)
        endpoints = re.findall(r'#\[(?:get|post|put|delete)\("([^"]+)"\)\]', content)
        imports = re.findall(r'use\s+([^;]+);', content)
        
        # Count lines
        lines = content.split('\n')
        code_lines = [l for l in lines if l.strip() and not l.strip().startswith('//')]
        
        return {
            'file': os.path.basename(filepath),
            'total_lines': len(lines),
            'code_lines': len(code_lines),
            'structs': structs,
            'functions': functions,
            'endpoints': endpoints,
            'imports': len(imports)
        }
    except Exception as e:
        return {'file': filepath, 'error': str(e)}

def analyze_directory(dirpath):
    """Analyze all Rust files in directory"""
    rust_files = list(Path(dirpath).rglob('*.rs'))
    results = []
    
    for filepath in rust_files:
        results.append(analyze_rust_file(str(filepath)))
    
    # Summary statistics
    total_files = len(results)
    total_lines = sum(r.get('code_lines', 0) for r in results)
    total_functions = sum(len(r.get('functions', [])) for r in results)
    total_endpoints = sum(len(r.get('endpoints', [])) for r in results)
    
    print(f"\n📊 RUST CODEBASE SUMMARY")
    print(f"{'='*50}")
    print(f"Files analyzed: {total_files}")
    print(f"Total code lines: {total_lines:,}")
    print(f"Total functions: {total_functions}")
    print(f"API endpoints: {total_endpoints}")
    print(f"\n📁 FILE BREAKDOWN:")
    
    for result in sorted(results, key=lambda x: x.get('code_lines', 0), reverse=True):
        if 'error' in result:
            continue
        print(f"\n  {result['file']} ({result['code_lines']} lines)")
        if result['endpoints']:
            print(f"    Endpoints: {', '.join(result['endpoints'])}")
        print(f"    Functions: {len(result['functions'])} | Structs: {len(result['structs'])}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python analyze-rust.py <file_or_directory>")
        sys.exit(1)
    
    target = sys.argv[1]
    
    if os.path.isfile(target):
        result = analyze_rust_file(target)
        print(f"\n📄 {result['file']}")
        print(f"Lines: {result['code_lines']}/{result['total_lines']}")
        print(f"Structs: {', '.join(result['structs']) if result['structs'] else 'None'}")
        print(f"Functions: {', '.join(result['functions'][:5])}{'...' if len(result['functions']) > 5 else ''}")
        if result['endpoints']:
            print(f"Endpoints: {', '.join(result['endpoints'])}")
    else:
        analyze_directory(target)
