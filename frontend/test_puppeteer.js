import puppeteer from 'puppeteer';
import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const rawSourceMap = fs.readFileSync('dist/assets/index-B2ZVSBhO.js.map', 'utf8');
  const consumer = await new SourceMapConsumer(rawSourceMap);
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  page.on('pageerror', async (error) => {
    console.log('PAGE ERROR CAUGHT:', error.message);
    const stack = error.stack.split('\n');
    for (const line of stack) {
       const match = line.match(/:(\d+):(\d+)/);
       if (match) {
           const l = parseInt(match[1]);
           const c = parseInt(match[2]);
           const pos = consumer.originalPositionFor({ line: l, column: c });
           console.log(`  at ${pos.source}:${pos.line}:${pos.column} (${pos.name})`);
       } else {
           console.log(line);
       }
    }
  });
  
  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    console.log("Successfully loaded preview");
  } catch(e) {
    console.log("Error loading page:", e);
  }
  
  await browser.close();
})();
