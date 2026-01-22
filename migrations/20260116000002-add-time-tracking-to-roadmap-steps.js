'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns already exist
    const [columns] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roadmap_steps' 
      AND column_name IN ('started_at', 'time_spent_minutes')
    `);
    
    const existingColumns = columns.map(c => c.column_name);

    // Add started_at column if it doesn't exist
    if (!existingColumns.includes('started_at')) {
      await queryInterface.addColumn('roadmap_steps', 'started_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ Added started_at column');
    } else {
      console.log('ℹ️ started_at column already exists');
    }

    // Add time_spent_minutes column if it doesn't exist
    if (!existingColumns.includes('time_spent_minutes')) {
      await queryInterface.addColumn('roadmap_steps', 'time_spent_minutes', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
      console.log('✅ Added time_spent_minutes column');
    } else {
      console.log('ℹ️ time_spent_minutes column already exists');
    }

    console.log('✅ Time tracking columns migration completed');
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns
    await queryInterface.removeColumn('roadmap_steps', 'started_at');
    await queryInterface.removeColumn('roadmap_steps', 'time_spent_minutes');
    
    console.log('✅ Removed time tracking columns');
  }
};
