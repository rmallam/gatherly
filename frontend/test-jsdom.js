const { JSDOM } = require("jsdom");
const fs = require('fs');
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');

const dom = new JSDOM(indexHtml, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
  beforeParse(window) {
    window.console.error = (msg, ...args) => {
        console.error("PAGE ERROR:", msg, ...args);
    };
    window.addEventListener("error", (event) => {
      console.error("UNCAUGHT:", event.error);
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("UNHANDLED REJECTION:", event.reason);
    });
  }
});

setTimeout(() => {
    console.log("Done waiting");
    process.exit(0);
}, 3000);
