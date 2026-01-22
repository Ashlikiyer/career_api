// Check if difficulty_level column exists
const { sequelize } = require('../models');

async function checkColumn() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roadmap_steps' 
      AND column_name = 'difficulty_level'
    `);
    
    if (results.length > 0) {
      console.log('✅ Column difficulty_level EXISTS');
      
      // Check if there are any non-beginner values
      const [counts] = await sequelize.query(`
        SELECT difficulty_level, COUNT(*) as count 
        FROM roadmap_steps 
        GROUP BY difficulty_level
      `);
      console.log('Current distribution:', counts);
    } else {
      console.log('❌ Column difficulty_level does NOT exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkColumn();
