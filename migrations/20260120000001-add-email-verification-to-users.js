'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add email verification columns to users table
    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'verification_code', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'verification_code_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Update existing users to be verified (so current users aren't locked out)
    await queryInterface.sequelize.query(
      `UPDATE users SET is_verified = true WHERE is_verified = false`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.removeColumn('users', 'verification_code');
    await queryInterface.removeColumn('users', 'verification_code_expires');
  }
};
