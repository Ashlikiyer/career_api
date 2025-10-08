'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assessments', 'current_career', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.addColumn('assessments', 'current_confidence', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('assessments', 'career_history', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('assessments', 'current_career');
    await queryInterface.removeColumn('assessments', 'current_confidence');
    await queryInterface.removeColumn('assessments', 'career_history');
  }
};