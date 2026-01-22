/**
 * Script to add difficulty_level to all roadmap steps in roadmapData.json
 * 
 * Difficulty Assignment Rules:
 * - Steps 1-3: "beginner" (Easy) - Foundational skills and introductory concepts
 * - Steps 4-7: "intermediate" (Medium) - Applied knowledge and problem-solving skills  
 * - Steps 8-10: "advanced" (Hard) - Industry-level and career-ready competencies
 */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../careerdata/roadmapData.json');
const outputPath = inputPath; // Overwrite the original file

// Read the existing data
const rawData = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(rawData);

// Function to determine difficulty level based on step number
function getDifficultyLevel(stepNumber) {
  if (stepNumber <= 3) {
    return 'beginner';
  } else if (stepNumber <= 7) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

// Track statistics
let totalCareers = 0;
let totalSteps = 0;
let difficultyCount = { beginner: 0, intermediate: 0, advanced: 0 };

// Process each career
for (const careerName in data.careers) {
  totalCareers++;
  const career = data.careers[careerName];
  
  if (career.roadmap && Array.isArray(career.roadmap)) {
    career.roadmap.forEach((step) => {
      // Add difficulty_level if not already present
      if (!step.difficulty_level) {
        step.difficulty_level = getDifficultyLevel(step.step);
      }
      
      totalSteps++;
      difficultyCount[step.difficulty_level]++;
    });
  }
}

// Write the updated data
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

// Print summary
console.log('✅ Successfully added difficulty_level to roadmapData.json');
console.log('');
console.log('📊 Statistics:');
console.log(`   Total careers processed: ${totalCareers}`);
console.log(`   Total steps processed: ${totalSteps}`);
console.log('');
console.log('📈 Difficulty Distribution:');
console.log(`   🌱 Beginner (Steps 1-3): ${difficultyCount.beginner} steps`);
console.log(`   📚 Intermediate (Steps 4-7): ${difficultyCount.intermediate} steps`);
console.log(`   🚀 Advanced (Steps 8-10): ${difficultyCount.advanced} steps`);
