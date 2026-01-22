'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roadmap_assessment_results', {
      result_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roadmap_assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roadmap_assessments',
          key: 'assessment_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      pass_fail_status: {
        type: Sequelize.ENUM('pass', 'fail', 'in_progress'),
        allowNull: false,
        defaultValue: 'in_progress'
      },
      attempt_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      answers: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'User answers for review and analytics'
      },
      time_taken_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Time taken to complete assessment'
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('user_roadmap_assessment_results', ['user_id']);
    await queryInterface.addIndex('user_roadmap_assessment_results', ['roadmap_assessment_id']);
    await queryInterface.addIndex('user_roadmap_assessment_results', ['pass_fail_status']);
    await queryInterface.addIndex('user_roadmap_assessment_results', ['user_id', 'roadmap_assessment_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roadmap_assessment_results');
  }
};
