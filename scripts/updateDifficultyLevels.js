// Update difficulty_level values based on step_number
const { sequelize } = require('../models');

async function updateDifficultyLevels() {
  try {
    console.log('Updating difficulty_level values...');
    
    // PostgreSQL requires casting to the ENUM type
    const [result] = await sequelize.query(`
      UPDATE roadmap_steps
      SET difficulty_level = (
        CASE
          WHEN step_number <= 3 THEN 'beginner'
          WHEN step_number <= 7 THEN 'intermediate'
          ELSE 'advanced'
        END
      )::"enum_roadmap_steps_difficulty_level"
    `);
    
    console.log('✅ Updated difficulty_level values');
    
    // Verify the distribution
    const [counts] = await sequelize.query(`
      SELECT difficulty_level, COUNT(*) as count 
      FROM roadmap_steps 
      GROUP BY difficulty_level
      ORDER BY 
        CASE difficulty_level 
          WHEN 'beginner' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
        END
    `);
    
    console.log('\n📊 New distribution:');
    counts.forEach(row => {
      const emoji = row.difficulty_level === 'beginner' ? '🌱' : 
                    row.difficulty_level === 'intermediate' ? '📚' : '🚀';
      console.log(`   ${emoji} ${row.difficulty_level}: ${row.count} steps`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateDifficultyLevels();
