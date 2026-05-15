import { JSDOM } from 'jsdom';
import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

async function run() {
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
    url: "http://localhost/",
    runScripts: "dangerously"
  });

  const scriptCode = fs.readFileSync('dist/assets/index-B2ZVSBhO.js', 'utf8');

  try {
    dom.window.eval(scriptCode);
    console.log("Executed successfully.");
  } catch (e) {
    console.log("Caught Error:", e.message);
    const rawSourceMap = fs.readFileSync('dist/assets/index-B2ZVSBhO.js.map', 'utf8');
    const consumer = await new SourceMapConsumer(rawSourceMap);
    
    const lines = e.stack.split('\n');
    for(const line of lines) {
        const match = line.match(/<anonymous>:(\d+):(\d+)/);
        if (match) {
            const l = parseInt(match[1]);
            const c = parseInt(match[2]);
            const pos = consumer.originalPositionFor({ line: l, column: c });
            console.log(`Mapped: ${pos.source}:${pos.line}:${pos.column} (${pos.name})`);
        } else {
            console.log(line);
        }
    }
    consumer.destroy();
  }
}
run();
