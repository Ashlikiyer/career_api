'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('career_roadmaps', {
      roadmap_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      saved_career_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'saved_careers',
          key: 'saved_career_id',
        },
        onDelete: 'CASCADE',
      },
      step_order: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_descriptions: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('career_roadmaps');
  }
};