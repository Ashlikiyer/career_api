'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roadmap_assessments', {
      assessment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      roadmap_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'career_roadmaps',
          key: 'roadmap_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10
        }
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      questions: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      passing_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 70,
        validate: {
          min: 0,
          max: 100
        }
      },
      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Optional time limit for assessment'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add unique constraint - one assessment per roadmap step
    await queryInterface.addConstraint('roadmap_assessments', {
      fields: ['roadmap_id', 'step_number'],
      type: 'unique',
      name: 'unique_roadmap_step_assessment'
    });

    // Add index for faster queries
    await queryInterface.addIndex('roadmap_assessments', ['roadmap_id']);
    await queryInterface.addIndex('roadmap_assessments', ['step_number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roadmap_assessments');
  }
};
