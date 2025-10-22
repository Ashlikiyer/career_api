'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add roadmap_id field to associate feedback with roadmaps
    await queryInterface.addColumn('user_feedback', 'roadmap_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roadmaps',
        key: 'roadmap_id'
      },
      onDelete: 'CASCADE'
    });

    // Add feedback_type enum to distinguish between assessment and roadmap feedback
    await queryInterface.addColumn('user_feedback', 'feedback_type', {
      type: Sequelize.ENUM('assessment', 'roadmap'),
      allowNull: false,
      defaultValue: 'assessment' // Default to assessment for existing records
    });

    // Add index for better query performance
    await queryInterface.addIndex('user_feedback', ['roadmap_id']);
    await queryInterface.addIndex('user_feedback', ['feedback_type']);
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns and indexes
    await queryInterface.removeIndex('user_feedback', ['feedback_type']);
    await queryInterface.removeIndex('user_feedback', ['roadmap_id']);
    await queryInterface.removeColumn('user_feedback', 'feedback_type');
    await queryInterface.removeColumn('user_feedback', 'roadmap_id');
  }
};
