/**
 * Script to refresh roadmap data for all users
 * This will delete all existing roadmap_steps and they will be recreated
 * with the new detailed structure when users next access their roadmaps
 */

const { RoadmapStep } = require('../models');

async function refreshRoadmapData() {
  try {
    console.log('🔄 Starting roadmap data refresh...');
    
    // Delete all existing roadmap steps
    const deletedCount = await RoadmapStep.destroy({
      where: {},
      truncate: true
    });
    
    console.log(`✅ Deleted ${deletedCount} roadmap steps`);
    console.log('✅ Roadmap data refresh complete!');
    console.log('📝 New roadmap steps with detailed structure will be created when users access their saved careers');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error refreshing roadmap data:', error);
    process.exit(1);
  }
}

refreshRoadmapData();
