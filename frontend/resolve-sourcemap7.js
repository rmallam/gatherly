import fs from 'fs';

async function resolve() {
  const generatedCode = fs.readFileSync('dist/assets/index-B2ZVSBhO.js', 'utf8');
  const lines = generatedCode.split('\n');
  if (lines.length >= 6) {
     const line6 = lines[5];
     const snippet = line6.substring(Math.max(0, 3318 - 80), 3318 + 80);
     console.log('Error context at line 6, col 3318:');
     console.log(snippet);
  }
}

resolve();
