const { JSDOM } = require("jsdom");
const fs = require('fs');
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');

const dom = new JSDOM(indexHtml, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
  beforeParse(window) {
    window.localStorage.setItem('token', 'guest_123');
    window.localStorage.setItem('guestEvents', '[]');
    window.localStorage.setItem('guestContacts', '[]');
    window.console.error = (msg, ...args) => {
        console.error("PAGE ERROR:", msg, ...args);
    };
    window.addEventListener("error", (event) => {
      console.error("UNCAUGHT:", event.error ? event.error.stack : event.message);
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("UNHANDLED REJECTION:", event.reason);
    });
  }
});

setTimeout(() => {
    console.log("Done waiting");
    process.exit(0);
}, 2000);
