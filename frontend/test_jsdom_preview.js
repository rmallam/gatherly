import { JSDOM } from 'jsdom';

async function test() {
  const dom = await JSDOM.fromURL("http://localhost:4173/", {
    runScripts: "dangerously",
    resources: "usable"
  });
  
  dom.window.addEventListener("error", (event) => {
    console.error("DOM Error:", event.error.message);
    console.error(event.error.stack);
  });
  
  setTimeout(() => {
    console.log("Finished waiting.");
    process.exit(0);
  }, 5000);
}

test();
