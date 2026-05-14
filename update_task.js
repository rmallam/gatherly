import fs from 'fs';
const path = '/Users/rakeshkumarmallam/.gemini/antigravity/brain/51718dae-3954-4bd9-ae72-8459a8e099b7/task.md';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('- [ ] Native Confirmations', '- [x] Native Confirmations');
content = content.replace('- [ ] Tap-to-Enlarge', '- [x] Tap-to-Enlarge');
fs.writeFileSync(path, content);
