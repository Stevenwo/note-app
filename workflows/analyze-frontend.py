#!/usr/bin/env python3
"""
Smart React/Next.js component analyzer
Token-efficient: Returns only component structure, not full code
"""

import sys
import os
from pathlib import Path
import re

def analyze_component(filepath):
    """Analyze a React component file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract key information
        component_name = re.search(r'export\s+(?:default\s+)?(?:function|const)\s+(\w+)', content)
        imports = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', content)
        state_hooks = re.findall(r'use(?:State|Effect|Context|Reducer|Memo|Callback|Ref)\(', content)
        props = re.search(r'(?:function|const)\s+\w+\s*\(\s*\{([^}]+)\}', content)
        
        # Count JSX elements
        jsx_elements = len(re.findall(r'<\w+', content))
        
        # Check for common patterns
        has_api_calls = bool(re.search(r'fetch\(|axios\.|useSWR\(', content))
        has_routing = bool(re.search(r'useRouter|usePathname|Link', content))
        has_forms = bool(re.search(r'<form|onSubmit', content))
        
        result = {
            'file': os.path.relpath(filepath, start=os.getcwd()),
            'component': component_name.group(1) if component_name else 'Unknown',
            'imports': len(imports),
            'hooks': len(state_hooks),
            'jsx_elements': jsx_elements,
            'has_api_calls': has_api_calls,
            'has_routing': has_routing,
            'has_forms': has_forms,
            'lines': len(content.split('\n'))
        }
        
        if props:
            prop_list = [p.strip().split(':')[0].strip() for p in props.group(1).split(',')]
            result['props'] = [p for p in prop_list if p]
        
        return result
        
    except Exception as e:
        return {'file': filepath, 'error': str(e)}

def analyze_frontend(dirpath):
    """Analyze all React components in frontend directory"""
    component_files = []
    
    # Find all component files
    for ext in ['tsx', 'jsx', 'ts', 'js']:
        component_files.extend(Path(dirpath).rglob(f'*.{ext}'))
    
    # Filter out node_modules and build directories
    component_files = [f for f in component_files if 'node_modules' not in str(f) and '.next' not in str(f)]
    
    results = []
    for filepath in component_files:
        result = analyze_component(str(filepath))
        if 'error' not in result:
            results.append(result)
    
    # Summary
    print(f"\n📊 FRONTEND ANALYSIS")
    print(f"{'='*60}")
    print(f"Components found: {len(results)}")
    print(f"Total lines: {sum(r['lines'] for r in results):,}")
    print(f"Components with API calls: {sum(1 for r in results if r['has_api_calls'])}")
    print(f"Components with routing: {sum(1 for r in results if r['has_routing'])}")
    print(f"Components with forms: {sum(1 for r in results if r['has_forms'])}")
    
    print(f"\n📁 COMPONENT BREAKDOWN:")
    for result in sorted(results, key=lambda x: x['lines'], reverse=True)[:10]:
        print(f"\n  {result['file']}")
        print(f"    Component: {result['component']} ({result['lines']} lines)")
        print(f"    Hooks: {result['hooks']} | JSX Elements: {result['jsx_elements']}")
        if result.get('props'):
            print(f"    Props: {', '.join(result['props'][:5])}{'...' if len(result['props']) > 5 else ''}")
        features = []
        if result['has_api_calls']: features.append('API')
        if result['has_routing']: features.append('Routing')
        if result['has_forms']: features.append('Forms')
        if features:
            print(f"    Features: {', '.join(features)}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        frontend_dir = './frontend/src'
    else:
        frontend_dir = sys.argv[1]
    
    if not os.path.exists(frontend_dir):
        print(f"Directory not found: {frontend_dir}")
        sys.exit(1)
    
    analyze_frontend(frontend_dir)
