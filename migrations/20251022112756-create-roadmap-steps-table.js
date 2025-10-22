'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('roadmap_steps', {
      step_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roadmap_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roadmaps',
          key: 'roadmap_id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resources: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      is_done: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add composite unique constraint to ensure one step per user per roadmap
    await queryInterface.addIndex('roadmap_steps', ['roadmap_id', 'user_id', 'step_number'], {
      unique: true,
      name: 'unique_user_roadmap_step'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('roadmap_steps');
  }
};
