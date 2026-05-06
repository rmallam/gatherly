const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '.maestro');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));

let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('- tapOn: "Sign In"')) {
    const parts = content.split('- tapOn: "Sign In"');

    // Some files tap "Sign In" twice. We want the LAST one.
    const injectString = `
# Handle new Welcome Tour overlay
- runFlow:
    when:
      visible: "Skip"
    commands:
      - tapOn: "Skip"
      - waitForAnimationToEnd
`;

    const lastPart = parts.pop();
    content = parts.join('- tapOn: "Sign In"') + '- tapOn: "Sign In"' + injectString + lastPart;

    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
    fixedCount++;
  }
}

console.log(`Finished fixing ${fixedCount} files.`);
