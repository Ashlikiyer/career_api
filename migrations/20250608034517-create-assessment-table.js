'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      CREATE TABLE assessment (
        assessmentid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      DROP TABLE assessment;
    `);
  }
};