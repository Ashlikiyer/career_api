/**
 * Roadmap Simplification Script
 * 
 * This script transforms the career roadmap data to be more beginner-friendly:
 * - Reduces resources to 2-3 per week (from 4-5)
 * - Prioritizes modern, short, interactive resources
 * - Updates platform information
 * - Removes outdated/long courses
 * 
 * Usage: node scripts/simplifyRoadmaps.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKUP_FILE = path.join(__dirname, '../careerdata/roadmapData_backup.json');
const OUTPUT_FILE = path.join(__dirname, '../careerdata/roadmapData.json');
const MAX_RESOURCES_PER_WEEK = 3;

// Priority platforms (modern, beginner-friendly, mostly free)
const PRIORITY_PLATFORMS = [
  'freeCodeCamp',
  'Codecademy', 
  'W3Schools',
  'MDN Web Docs',
  'MDN',
  'Fireship',
  'YouTube',
  'The Odin Project',
  'React.dev',
  'Node.js',
  'Express.js',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'Google',
  'Microsoft Learn',
  'Khan Academy',
  'Kaggle',
  'LeetCode',
  'HackerRank',
  'Real Python'
];

// Platforms to deprioritize (long courses, paid, or outdated)
const DEPRIORITIZE_PLATFORMS = [
  'edX',
  'MIT',
  'Udemy',
  'Pluralsight',
  'LinkedIn Learning'
];

// Resource type preferences
const PREFERRED_TYPES = [
  'Interactive Tutorial',
  'Interactive Course',
  'Interactive Game',
  'Documentation',
  'Video Tutorial',
  'Article',
  'Getting Started',
  'Quick Start'
];

/**
 * Calculate a priority score for a resource
 */
function getResourceScore(resource) {
  let score = 50; // Base score
  
  // Platform scoring
  const platform = resource.platform || '';
  const title = resource.title || '';
  const type = resource.type || '';
  const duration = resource.duration || '';
  
  // Priority platform bonus
  for (const pp of PRIORITY_PLATFORMS) {
    if (platform.toLowerCase().includes(pp.toLowerCase()) || 
        title.toLowerCase().includes(pp.toLowerCase())) {
      score += 30;
      break;
    }
  }
  
  // Deprioritize certain platforms
  for (const dp of DEPRIORITIZE_PLATFORMS) {
    if (platform.toLowerCase().includes(dp.toLowerCase())) {
      score -= 20;
      break;
    }
  }
  
  // Preferred type bonus
  for (const pt of PREFERRED_TYPES) {
    if (type.toLowerCase().includes(pt.toLowerCase())) {
      score += 15;
      break;
    }
  }
  
  // Short content bonus
  if (duration) {
    const durationLower = duration.toLowerCase();
    // Very short content (under 1 hour)
    if (durationLower.includes('minute') || 
        durationLower.includes('30') ||
        durationLower.includes('< 1') ||
        durationLower.includes('1 hour') ||
        durationLower.includes('1-2 hour')) {
      score += 20;
    }
    // Medium content (1-3 hours)
    else if (durationLower.includes('2 hour') || durationLower.includes('3 hour')) {
      score += 10;
    }
    // Long content (penalize)
    else if (durationLower.includes('12 hour') || 
             durationLower.includes('9 week') ||
             durationLower.includes('10 hour') ||
             durationLower.includes('course')) {
      score -= 15;
    }
  }
  
  // Interactive content bonus
  if (type.toLowerCase().includes('interactive') ||
      platform.toLowerCase().includes('froggy') ||
      platform.toLowerCase().includes('garden') ||
      platform.toLowerCase().includes('game')) {
    score += 25;
  }
  
  // Official documentation bonus
  if (title.toLowerCase().includes('getting started') ||
      title.toLowerCase().includes('quick start') ||
      title.toLowerCase().includes('official') ||
      type.toLowerCase().includes('documentation')) {
    score += 15;
  }
  
  // Fireship "100 Seconds" videos are great
  if (title.toLowerCase().includes('100 seconds') ||
      platform.toLowerCase().includes('fireship')) {
    score += 35;
  }
  
  return score;
}

/**
 * Select the best resources from a list
 */
function selectBestResources(resources, maxCount = MAX_RESOURCES_PER_WEEK) {
  if (!resources || resources.length === 0) return [];
  if (resources.length <= maxCount) return resources;
  
  // Score and sort resources
  const scoredResources = resources.map(r => ({
    resource: r,
    score: getResourceScore(r)
  }));
  
  scoredResources.sort((a, b) => b.score - a.score);
  
  // Select top resources, ensuring variety
  const selected = [];
  const selectedPlatforms = new Set();
  
  for (const { resource } of scoredResources) {
    if (selected.length >= maxCount) break;
    
    const platform = resource.platform || 'Unknown';
    
    // Try to get variety in platforms (if we have room)
    if (selected.length < maxCount - 1 || !selectedPlatforms.has(platform)) {
      selected.push(resource);
      selectedPlatforms.add(platform);
    }
  }
  
  // If we still need more, just take top scored
  while (selected.length < maxCount && selected.length < scoredResources.length) {
    const next = scoredResources.find(sr => !selected.includes(sr.resource));
    if (next) selected.push(next.resource);
    else break;
  }
  
  return selected;
}

/**
 * Simplify duration text
 */
function simplifyDuration(duration) {
  if (!duration) return '1-2 hours';
  
  // Already simplified
  if (duration.match(/^\d+-?\d*\s*(hour|minute|min)/i)) {
    return duration;
  }
  
  const lower = duration.toLowerCase();
  
  if (lower.includes('week')) {
    return '2-3 hours';
  }
  if (lower.includes('12 hour') || lower.includes('10 hour')) {
    return '2-3 hours (selected sections)';
  }
  if (lower.includes('hour')) {
    return duration;
  }
  
  return '1-2 hours';
}

/**
 * Process a single week's data
 */
function processWeek(week) {
  if (!week || !week.resources) return week;
  
  const newWeek = { ...week };
  
  // Handle resources that are just URL strings
  let resources = week.resources;
  if (resources.length > 0 && typeof resources[0] === 'string') {
    // Convert URL strings to proper resource objects
    resources = resources.map(url => ({
      title: extractTitleFromUrl(url),
      url: url,
      type: 'Video Tutorial',
      platform: extractPlatformFromUrl(url),
      duration: '1-2 hours'
    }));
  }
  
  // Select best resources
  const bestResources = selectBestResources(resources, MAX_RESOURCES_PER_WEEK);
  
  // Clean up each resource
  newWeek.resources = bestResources.map(resource => {
    const cleaned = { ...resource };
    
    // Simplify duration
    if (cleaned.duration) {
      cleaned.duration = simplifyDuration(cleaned.duration);
    }
    
    // Remove unnecessary fields
    delete cleaned.topics; // Sometimes has redundant topic lists
    
    return cleaned;
  });
  
  return newWeek;
}

/**
 * Extract platform name from URL
 */
function extractPlatformFromUrl(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('coursera.org')) return 'Coursera';
  if (url.includes('udemy.com')) return 'Udemy';
  if (url.includes('w3schools.com')) return 'W3Schools';
  if (url.includes('freecodecamp.org')) return 'freeCodeCamp';
  if (url.includes('codecademy.com')) return 'Codecademy';
  if (url.includes('khanacademy.org')) return 'Khan Academy';
  if (url.includes('mozilla.org') || url.includes('mdn')) return 'MDN Web Docs';
  if (url.includes('github.com')) return 'GitHub';
  return 'Online';
}

/**
 * Extract a reasonable title from URL
 */
function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    // Extract last meaningful part of path
    const parts = path.split('/').filter(p => p.length > 0);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      // Convert dashes/underscores to spaces and capitalize
      return lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .substring(0, 50);
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  return 'Learning Resource';
}

/**
 * Process a single step in the roadmap
 */
function processStep(step) {
  if (!step) return step;
  
  const newStep = { ...step };
  
  // Process all weeks
  if (newStep.weeks && Array.isArray(newStep.weeks)) {
    newStep.weeks = newStep.weeks.map(processWeek);
  }
  
  return newStep;
}

/**
 * Process a single career's roadmap
 */
function processCareer(careerName, careerData) {
  if (!careerData || !careerData.roadmap) {
    console.log(`  ⚠️  Skipping ${careerName} - no roadmap data`);
    return careerData;
  }
  
  const newCareerData = { ...careerData };
  
  // Process all steps
  newCareerData.roadmap = careerData.roadmap.map(processStep);
  
  // Count resources
  let totalWeeks = 0;
  let totalResources = 0;
  
  for (const step of newCareerData.roadmap) {
    if (step.weeks) {
      for (const week of step.weeks) {
        totalWeeks++;
        totalResources += (week.resources || []).length;
      }
    }
  }
  
  const avgResources = totalWeeks > 0 ? (totalResources / totalWeeks).toFixed(1) : 0;
  console.log(`  ✅ ${careerName}: ${newCareerData.roadmap.length} steps, ${totalWeeks} weeks, avg ${avgResources} resources/week`);
  
  return newCareerData;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Roadmap Simplification Script');
  console.log('================================\n');
  
  // Check if backup exists
  if (!fs.existsSync(BACKUP_FILE)) {
    console.error('❌ Error: Backup file not found:', BACKUP_FILE);
    console.log('Please ensure roadmapData_backup.json exists.');
    process.exit(1);
  }
  
  // Read the backup file
  console.log('📖 Reading backup file...');
  const rawData = fs.readFileSync(BACKUP_FILE, 'utf8');
  let data;
  
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.error('❌ Error: Invalid JSON in backup file');
    console.error(e.message);
    process.exit(1);
  }
  
  // Process each career
  console.log('\n🔄 Processing careers...\n');
  
  const careers = data.careers || {};
  const processedCareers = {};
  
  for (const [careerName, careerData] of Object.entries(careers)) {
    processedCareers[careerName] = processCareer(careerName, careerData);
  }
  
  // Create the new data structure
  const newData = {
    careers: processedCareers
  };
  
  // Write the output file
  console.log('\n💾 Writing simplified roadmap data...');
  
  try {
    const outputJson = JSON.stringify(newData, null, 2);
    fs.writeFileSync(OUTPUT_FILE, outputJson, 'utf8');
    
    // Calculate file sizes
    const originalSize = fs.statSync(BACKUP_FILE).size;
    const newSize = fs.statSync(OUTPUT_FILE).size;
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`\n✅ Success!`);
    console.log(`   Original size: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   New size: ${(newSize / 1024).toFixed(1)} KB`);
    console.log(`   Reduction: ${reduction}%`);
    console.log(`\n   Output: ${OUTPUT_FILE}`);
    
  } catch (e) {
    console.error('❌ Error writing output file:', e.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Roadmap simplification complete!\n');
}

// Run
main().catch(console.error);
