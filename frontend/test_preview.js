import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    console.log("Successfully loaded preview");
  } catch(e) {
    console.log("Error loading page:", e);
  }
  
  await browser.close();
})();
