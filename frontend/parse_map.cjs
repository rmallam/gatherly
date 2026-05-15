const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

const mapRaw = fs.readFileSync('dist/assets/index-CirM5B8j.js.map', 'utf8');

async function run() {
  const consumer = await new SourceMapConsumer(JSON.parse(mapRaw));
  const pos = consumer.originalPositionFor({
    line: 6,
    column: 3318
  });
  console.log(pos);
}
run();
