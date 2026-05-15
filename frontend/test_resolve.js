import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function resolve() {
  const rawSourceMap = fs.readFileSync('dist/assets/index-B2ZVSBhO.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  const pos = consumer.originalPositionFor({
    line: 6,
    column: 3318
  });
  console.log("Line 6, Col 3318 Maps to:");
  console.log(pos);
  
  const pos8 = consumer.originalPositionFor({
    line: 8,
    column: 3318 // Maybe the stack trace on Android is shifted? Let's check line 8 col 3318
  });
  console.log("Line 8, Col 3318 Maps to:");
  console.log(pos8);
  
  // Also dump a bunch of columns around line 6 col 3318
  console.log("Context around Line 6, Col 3318:");
  for (let c = 3300; c < 3330; c++) {
      const p = consumer.originalPositionFor({ line: 6, column: c });
      if (p.source) console.log(`Col ${c} -> ${p.source}:${p.line}:${p.name}`);
  }
  
  // Dump context around Line 8, Col 3318
  console.log("Context around Line 8, Col 3318:");
  for (let c = 3300; c < 3330; c++) {
      const p = consumer.originalPositionFor({ line: 8, column: c });
      if (p.source) console.log(`Col ${c} -> ${p.source}:${p.line}:${p.name}`);
  }
  
  consumer.destroy();
}

resolve();
