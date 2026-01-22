'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roadmap_steps' 
      AND column_name = 'difficulty_level'
    `);

    if (columns.length === 0) {
      // Add difficulty_level column to roadmap_steps table
      await queryInterface.addColumn('roadmap_steps', 'difficulty_level', {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
        defaultValue: 'beginner'
      });
      console.log('✅ Added difficulty_level column to roadmap_steps table');
    } else {
      console.log('ℹ️ difficulty_level column already exists, skipping creation');
    }

    // Update existing rows based on step_number pattern:
    // Steps 1-3: beginner, Steps 4-7: intermediate, Steps 8-10: advanced
    await queryInterface.sequelize.query(`
      UPDATE roadmap_steps
      SET difficulty_level = (
        CASE
          WHEN step_number <= 3 THEN 'beginner'
          WHEN step_number <= 7 THEN 'intermediate'
          ELSE 'advanced'
        END
      )::"enum_roadmap_steps_difficulty_level"
    `);

    console.log('✅ Updated existing rows with appropriate difficulty levels');
  },

  async down(queryInterface, Sequelize) {
    // Remove the difficulty_level column
    await queryInterface.removeColumn('roadmap_steps', 'difficulty_level');
    
    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_roadmap_steps_difficulty_level";
    `);

    console.log('✅ Removed difficulty_level column from roadmap_steps table');
  }
};
