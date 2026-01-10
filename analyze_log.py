import re

try:
    with open('build_debug_prerender.log', 'r', encoding='utf-16', errors='ignore') as f:
        content = f.read()
    
    # Find SyntaxError and surrounding lines
    matches = re.finditer(r'(SyntaxError.*)', content)
    for match in matches:
        print(f"Error found: {match.group(1)}")
        # Print preceding lines to find file path
        start = max(0, match.start() - 500)
        print(content[start:match.start()])

except Exception as e:
    print(e)
