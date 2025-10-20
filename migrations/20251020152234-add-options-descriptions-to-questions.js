'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('questions', 'options_descriptions', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON string containing descriptions for each answer option'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('questions', 'options_descriptions');
  }
};
