import { JSDOM } from 'jsdom';
import fs from 'fs';
import sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
  environment: 'node'
});

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost/",
  runScripts: "dangerously"
});

// Provide a fake window and document to node's global so source-map-support works or whatever
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

const scriptCode = fs.readFileSync('dist/assets/index-B2ZVSBhO.js', 'utf8');

// We need to append the sourceMappingURL so source-map-support can find it
// Also we must run it via Node's eval or JSDOM's eval.
try {
  dom.window.eval(scriptCode);
} catch (e) {
  console.log("Caught Error:");
  console.log(e.stack);
}
