import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function resolve() {
  const rawSourceMap = fs.readFileSync('dist/assets/index-q6AtTdp6.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  
  const generatedCode = fs.readFileSync('dist/assets/index-q6AtTdp6.js', 'utf8');
  
  // Find "Cannot access" or "before initialization" in the code maybe? No, that's a runtime error thrown by the JS engine.
  // Let's find occurrences of "const o=" or "let o=" in line 6.
  const lines = generatedCode.split('\n');
  if (lines.length >= 6) {
     const line6 = lines[5];
     let idx = 0;
     while ((idx = line6.indexOf('const o=', idx)) !== -1) {
         const pos = consumer.originalPositionFor({
            line: 6,
            column: idx
         });
         console.log(`const o= at column ${idx}:`, pos);
         idx++;
     }
     idx = 0;
     while ((idx = line6.indexOf('let o=', idx)) !== -1) {
         const pos = consumer.originalPositionFor({
            line: 6,
            column: idx
         });
         console.log(`let o= at column ${idx}:`, pos);
         idx++;
     }
  }
  
  consumer.destroy();
}

resolve();
