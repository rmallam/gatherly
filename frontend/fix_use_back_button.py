import os
import glob
import re

dir_path = "src/components/tabs/"
files = glob.glob(dir_path + "*.jsx")

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find all useBackButton(...) lines
    use_back_lines = []
    
    # We will match lines like '    useBackButton(...);'
    lines = content.split('\n')
    new_lines = []
    extracted = []
    
    in_component = False
    
    for line in lines:
        if 'useBackButton(' in line and not 'import' in line and not 'function' in line and not '//' in line.strip()[:2]:
            extracted.append(line)
        else:
            new_lines.append(line)
            
    if not extracted:
        continue
        
    # Find the main return statement of the component
    # We look for the first '    return (' or '    return(' at the component root level
    # Since these are tabs, usually it's `    return (`
    
    insert_idx = -1
    for i, line in enumerate(new_lines):
        if line.startswith('    return (') or line.startswith('    return('):
            insert_idx = i
            break
            
    if insert_idx != -1:
        # Insert them right before return
        # Add an empty line before them for spacing
        new_lines.insert(insert_idx, "")
        for ext in reversed(extracted):
            new_lines.insert(insert_idx, ext)
            
        with open(file_path, 'w') as f:
            f.write('\n'.join(new_lines))
        print(f"Fixed {file_path}")
    else:
        print(f"Could not find return in {file_path}")
