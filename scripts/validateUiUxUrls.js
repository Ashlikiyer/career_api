/**
 * Validate UX/UI Designer URLs
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
const uiux = data.careers['UX/UI Designer'];

// Extract all unique URLs
const urls = new Set();
uiux.roadmap.forEach(step => {
  step.weeks.forEach(week => {
    week.resources.forEach(r => {
      if (r.url) urls.add(r.url);
    });
  });
});

console.log('Total unique URLs:', urls.size);
console.log('Checking URLs...\n');

async function checkUrl(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, res => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', e => resolve({ url, status: 'ERROR', ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT', ok: false }); });
    req.end();
  });
}

async function main() {
  const urlArray = [...urls];
  const results = [];
  
  // Check in batches of 10
  for (let i = 0; i < urlArray.length; i += 10) {
    const batch = urlArray.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    console.log(`Checked ${Math.min(i + 10, urlArray.length)}/${urlArray.length}`);
  }
  
  const broken = results.filter(r => !r.ok);
  const valid = results.filter(r => r.ok);
  
  console.log('\n=== RESULTS ===');
  console.log(`Valid: ${valid.length}`);
  console.log(`Broken/Issues: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log('\nBroken URLs:');
    broken.forEach(r => console.log(`  ${r.status}: ${r.url}`));
  }
  
  // Save results
  fs.writeFileSync(
    path.join(__dirname, '../careerdata/uiux_url_check.json'),
    JSON.stringify({ valid: valid.length, broken: broken.length, brokenUrls: broken }, null, 2)
  );
}

main();
