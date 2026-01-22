'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.role) {
      // Create ENUM type for role
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
            CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin');
          END IF;
        END$$;
      `);

      // Add role column with default 'user'
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      });

      console.log('✅ Added role column to users table');
    } else {
      console.log('⏭️ role column already exists, skipping');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
};
