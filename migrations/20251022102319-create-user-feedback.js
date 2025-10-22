'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_feedback', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow anonymous feedback
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow feedback without specific assessment reference
        references: {
          model: 'assessments',
          key: 'assessment_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      feedback_text: {
        type: Sequelize.TEXT,
        allowNull: true // Optional text feedback
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('user_feedback', ['user_id']);
    await queryInterface.addIndex('user_feedback', ['assessment_id']);
    await queryInterface.addIndex('user_feedback', ['rating']);
    await queryInterface.addIndex('user_feedback', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_feedback');
  }
};
