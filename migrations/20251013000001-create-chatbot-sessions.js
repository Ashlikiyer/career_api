'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chatbot_sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'CASCADE'
      },
      session_uuid: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      last_active: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });

    await queryInterface.addIndex('chatbot_sessions', ['user_id'], {
      name: 'idx_chatbot_sessions_user_id'
    });

    await queryInterface.addIndex('chatbot_sessions', ['last_active'], {
      name: 'idx_chatbot_sessions_last_active'
    });

    await queryInterface.addIndex('chatbot_sessions', ['session_uuid'], {
      name: 'idx_chatbot_sessions_session_uuid'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chatbot_sessions');
  }
};