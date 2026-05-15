import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function resolve() {
  const rawSourceMap = fs.readFileSync('dist/assets/index-B2ZVSBhO.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  const pos = consumer.originalPositionFor({
    line: 6,
    column: 3318
  });
  console.log(pos);
  consumer.destroy();
}

resolve();
