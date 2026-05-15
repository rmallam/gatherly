const fs = require('fs');
const glob = require('glob'); // use standard fs since glob might not be installed

const dir = 'src/components/tabs/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const content = fs.readFileSync(dir + file, 'utf8');
  const lines = content.split('\n');
  
  const stateVars = [];
  
  lines.forEach((line, index) => {
    // track state vars
    const match = line.match(/const\s+\[([a-zA-Z0-9_]+),\s*set/);
    if (match) {
        stateVars.push({ name: match[1], line: index + 1 });
    }
    
    // check useBackButton
    if (line.includes('useBackButton(')) {
        for (const sv of stateVars) {
            // this is fine if declared before
        }
        
        // Wait, just extract arguments and see if they are declared LATER
        const argsMatch = line.match(/useBackButton\([^,]+,\s*([^)]+)\)/);
        if (argsMatch) {
             const arg = argsMatch[1].replace(/!/g, '').trim();
             // Find where arg is declared
             const declLine = lines.findIndex(l => l.includes(`const [${arg}`) || l.includes(`const ${arg} =`));
             if (declLine !== -1 && declLine > index) {
                 console.log(`❌ ERROR in ${file}: '${arg}' used on line ${index+1} but declared on line ${declLine+1}`);
             }
             
             // Also check the first argument (handler function)
             const handlerMatch = line.match(/useBackButton\(([^,]+),/);
             if (handlerMatch) {
                 let handler = handlerMatch[1].trim();
                 if (handler.startsWith('() =>')) return; // inline is fine
                 
                 const hDeclLine = lines.findIndex(l => l.includes(`const ${handler} =`) || l.includes(`function ${handler}`));
                 if (hDeclLine !== -1 && hDeclLine > index) {
                     console.log(`❌ ERROR in ${file}: handler '${handler}' used on line ${index+1} but declared on line ${hDeclLine+1}`);
                 }
             }
        }
    }
  });
}
