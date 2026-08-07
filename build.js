const fs = require('fs');
const path = require('path');

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || '';

if (!GA_MEASUREMENT_ID) {
  console.warn('GA_MEASUREMENT_ID is not set — Google Analytics will be disabled in this build.');
}

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

for (const file of ['index.html', 'advisory.html']) {
  const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const out = src.replaceAll('__GA_MEASUREMENT_ID__', GA_MEASUREMENT_ID);
  fs.writeFileSync(path.join(outDir, file), out);
}

console.log(`Built ${outDir} with GA_MEASUREMENT_ID=${GA_MEASUREMENT_ID || '(none)'}`);
