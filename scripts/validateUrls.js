/**
 * URL Validation Script for Roadmap Resources
 * Checks all resource URLs to ensure they're still accessible
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const roadmapPath = path.join(__dirname, '../careerdata/roadmapData.json');
const roadmapData = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));

// Collect all URLs with location info for fixing later
const allUrls = [];

function extractUrls(career, careerName) {
  if (!career || !career.roadmap) return;
  
  // Handle roadmap object with numbered keys (0, 1, 2, ...)
  Object.entries(career.roadmap).forEach(([stepKey, step]) => {
    if (step && step.weeks) {
      Object.entries(step.weeks).forEach(([weekKey, week]) => {
        if (week.resources && Array.isArray(week.resources)) {
          week.resources.forEach((resource, resIndex) => {
            if (typeof resource === 'string') {
              allUrls.push({
                career: careerName,
                stepKey: stepKey,
                stepTitle: step.title || `Step ${parseInt(stepKey) + 1}`,
                weekKey: weekKey,
                weekTopic: week.topic || `Week ${weekKey}`,
                resourceIndex: resIndex,
                url: resource,
                title: 'URL String'
              });
            } else if (resource && resource.url) {
              allUrls.push({
                career: careerName,
                stepKey: stepKey,
                stepTitle: step.title || `Step ${parseInt(stepKey) + 1}`,
                weekKey: weekKey,
                weekTopic: week.topic || `Week ${weekKey}`,
                resourceIndex: resIndex,
                url: resource.url,
                title: resource.title || 'No title',
                platform: resource.platform || 'Unknown'
              });
            }
          });
        }
      });
    }
  });
}

// Extract all URLs from all careers (wrapped in 'careers' object)
const careers = roadmapData.careers || roadmapData;
Object.entries(careers).forEach(([careerName, careerData]) => {
  extractUrls(careerData, careerName);
});

console.log(`\n📊 Found ${allUrls.length} total resource URLs across all careers\n`);

// Check URL validity
async function checkUrl(urlInfo) {
  return new Promise((resolve) => {
    const url = urlInfo.url;
    
    if (!url || !url.startsWith('http')) {
      resolve({ ...urlInfo, status: 'INVALID', error: 'Invalid URL format' });
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    try {
      const req = protocol.request(url, options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ ...urlInfo, status: 'OK', statusCode: res.statusCode });
        } else if (res.statusCode === 403 || res.statusCode === 405) {
          // Some sites block HEAD requests, try to consider them valid
          resolve({ ...urlInfo, status: 'MAYBE', statusCode: res.statusCode });
        } else {
          resolve({ ...urlInfo, status: 'BROKEN', statusCode: res.statusCode });
        }
      });
      
      req.on('error', (err) => {
        resolve({ ...urlInfo, status: 'ERROR', error: err.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ ...urlInfo, status: 'TIMEOUT', error: 'Request timed out' });
      });
      
      req.end();
    } catch (err) {
      resolve({ ...urlInfo, status: 'ERROR', error: err.message });
    }
  });
}

// Process in batches to avoid overwhelming
async function validateAllUrls() {
  const batchSize = 10;
  const results = [];
  
  console.log('🔍 Validating URLs... This may take a few minutes.\n');
  
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    
    // Progress indicator
    const progress = Math.round(((i + batch.length) / allUrls.length) * 100);
    process.stdout.write(`\rProgress: ${progress}% (${i + batch.length}/${allUrls.length})`);
  }
  
  console.log('\n\n');
  
  // Categorize results
  const broken = results.filter(r => r.status === 'BROKEN' || r.status === 'ERROR' || r.status === 'TIMEOUT');
  const maybe = results.filter(r => r.status === 'MAYBE');
  const ok = results.filter(r => r.status === 'OK');
  
  console.log('=' .repeat(80));
  console.log('📋 VALIDATION SUMMARY');
  console.log('=' .repeat(80));
  console.log(`✅ Valid URLs: ${ok.length}`);
  console.log(`⚠️  Uncertain (blocked HEAD): ${maybe.length}`);
  console.log(`❌ Broken/Error URLs: ${broken.length}`);
  console.log('=' .repeat(80));
  
  if (broken.length > 0) {
    console.log('\n❌ BROKEN/ERROR URLs:');
    console.log('-'.repeat(80));
    
    // Group by career
    const brokenByCareer = {};
    broken.forEach(b => {
      if (!brokenByCareer[b.career]) brokenByCareer[b.career] = [];
      brokenByCareer[b.career].push(b);
    });
    
    Object.entries(brokenByCareer).forEach(([career, items]) => {
      console.log(`\n📁 ${career} (${items.length} broken):`);
      items.forEach(item => {
        console.log(`   📍 Step ${parseInt(item.stepKey)+1}: ${item.stepTitle}`);
        console.log(`      Week: ${item.weekTopic}`);
        console.log(`      Title: ${item.title}`);
        console.log(`      Platform: ${item.platform || 'N/A'}`);
        console.log(`      URL: ${item.url}`);
        console.log(`      Status: ${item.status} ${item.statusCode || ''} ${item.error || ''}`);
        console.log('');
      });
    });
  }
  
  if (maybe.length > 0) {
    console.log('\n⚠️  UNCERTAIN URLs (site blocks HEAD requests):');
    console.log('-'.repeat(80));
    maybe.slice(0, 20).forEach(item => {
      console.log(`${item.career} - Step ${item.step}: ${item.url}`);
    });
    if (maybe.length > 20) {
      console.log(`... and ${maybe.length - 20} more`);
    }
  }
  
  // Save results to file
  const outputPath = path.join(__dirname, '../careerdata/url_validation_results.json');
  fs.writeFileSync(outputPath, JSON.stringify({ 
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      ok: ok.length,
      maybe: maybe.length,
      broken: broken.length
    },
    broken,
    maybe
  }, null, 2));
  
  console.log(`\n📄 Full results saved to: ${outputPath}`);
}

validateAllUrls().catch(console.error);
