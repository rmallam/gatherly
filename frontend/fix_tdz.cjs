const fs = require('fs');
const path = require('path');

const dir = 'src/components/tabs/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (let file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    // Find lines with useBackButton
    const hookLines = [];
    const restLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('useBackButton(') && !lines[i].includes('import')) {
            hookLines.push(lines[i]);
        } else {
            restLines.push(lines[i]);
        }
    }
    
    if (hookLines.length === 0) continue;
    
    // Find the first `if (` or `useEffect(` or `return` inside the component
    // We look for them after the component declaration `const Component = ({`
    
    let componentStart = -1;
    for (let i = 0; i < restLines.length; i++) {
        if (restLines[i].match(/const\s+[A-Z][a-zA-Z0-9_]+\s*=\s*\([^)]*\)\s*=>/)) {
            componentStart = i;
            break;
        }
    }
    
    if (componentStart !== -1) {
        let insertIndex = -1;
        // Find the last const [var, setVar] = useState
        let lastUseState = componentStart;
        for (let i = componentStart + 1; i < restLines.length; i++) {
            if (restLines[i].includes('const [') || restLines[i].includes('const handle') || restLines[i].includes('function handle')) {
                lastUseState = i;
            }
            if (restLines[i].includes('if (') || restLines[i].includes('useEffect(') || restLines[i].includes('return (')) {
                break;
            }
        }
        
        insertIndex = lastUseState + 1;
        
        // Insert hookLines
        restLines.splice(insertIndex, 0, ...hookLines);
        
        fs.writeFileSync(filePath, restLines.join('\n'));
        console.log(`Fixed ${file}`);
    }
}
