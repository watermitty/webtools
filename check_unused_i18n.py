import os
import re

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check for useI18n import
    if "import { useI18n } from 'vue-i18n'" not in content and 'import { useI18n } from "vue-i18n"' not in content:
        return None

    # Check for destructuring
    match = re.search(r'const\s+\{\s*t\s*\}\s*=\s*useI18n\(\)', content)
    if not match:
        # Maybe it extracts other things or just useI18n()
        return None

    # Check if 't' is used elsewhere in script
    # We strip the definition line to avoid self-match
    script_content = content
    script_start = content.find('<script')
    script_end = content.find('</script>')
    if script_start != -1 and script_end != -1:
        script_content = content[script_start:script_end]
        
    # Remove the definition line
    script_content_no_def = script_content.replace(match.group(0), '')
    
    # Simple check for 't(' or ' t ' or 't.' usage in script
    # This is a heuristic
    if re.search(r'\bt\(', script_content_no_def):
        return None # Used as function
    
    return f"Unused 't' from useI18n in {filepath}"

def main():
    root_dir = r"d:\projects\tool\webtools\src\components"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".vue"):
                res = check_file(os.path.join(root, file))
                if res:
                    print(res)

if __name__ == "__main__":
    main()
