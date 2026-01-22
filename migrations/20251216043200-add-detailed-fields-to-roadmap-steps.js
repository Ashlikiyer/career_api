'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add weeks column (JSON array of week objects)
    await queryInterface.addColumn('roadmap_steps', 'weeks', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });

    // Add milestone_project column (JSON object)
    await queryInterface.addColumn('roadmap_steps', 'milestone_project', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('roadmap_steps', 'weeks');
    await queryInterface.removeColumn('roadmap_steps', 'milestone_project');
  }
};
