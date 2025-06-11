'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('questions', 'assessment_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL for flexibility with existing questions
      references: {
        model: 'assessments',
        key: 'assessment_id',
      },
      onDelete: 'SET NULL', // If assessment is deleted, set to NULL
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('questions', 'assessment_id');
  },
};