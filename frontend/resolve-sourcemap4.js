import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function resolve() {
  const rawSourceMap = fs.readFileSync('dist/assets/index-q6AtTdp6.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  const pos = consumer.originalPositionFor({
    line: 6,
    column: 3318
  });
  console.log(pos);
  
  const generatedCode = fs.readFileSync('dist/assets/index-q6AtTdp6.js', 'utf8');
  const lines = generatedCode.split('\n');
  if (lines.length >= 6) {
     const line = lines[5];
     console.log('Code around error:', line.substring(3318 - 50, 3318 + 50));
  }
  
  consumer.destroy();
}

resolve();
