import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function resolve() {
  const rawSourceMap = fs.readFileSync('dist/assets/index-q6AtTdp6.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  
  // Try to find what 'o' is referring to by looking at the generated source around line 8
  const generatedCode = fs.readFileSync('dist/assets/index-q6AtTdp6.js', 'utf8');
  const lines = generatedCode.split('\n');
  if (lines.length >= 8) {
     const line8 = lines[7];
     console.log('Line 8 snippet:', line8.substring(0, 100));
     
     // Find addListener inside line 8
     let idx = line8.indexOf('addListener');
     if (idx !== -1) {
         const pos = consumer.originalPositionFor({
            line: 8,
            column: idx
         });
         console.log('addListener position:', pos);
     }
  }
  
  consumer.destroy();
}

resolve();
