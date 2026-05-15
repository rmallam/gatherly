import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  page.on('pageerror', async (error) => {
    console.log('PAGE ERROR CAUGHT:', error.message);
    console.log(error.stack);
  });
  
  try {
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle0' });
    console.log("Successfully loaded preview");
  } catch(e) {
    console.log("Error loading page:", e);
  }
  
  await browser.close();
})();
