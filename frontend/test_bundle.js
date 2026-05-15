import fs from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
  url: "https://localhost/",
  runScripts: "dangerously"
});

const scriptContent = fs.readFileSync('dist/assets/index-B2ZVSBhO.js', 'utf8');

try {
  dom.window.eval(scriptContent);
  console.log("No error thrown immediately");
} catch(e) {
  console.error("Caught error:", e);
}
