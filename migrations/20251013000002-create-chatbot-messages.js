'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chatbot_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chatbot_sessions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      message_type: {
        type: Sequelize.ENUM('user', 'bot'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      response_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      career: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      }
    });

    await queryInterface.addIndex('chatbot_messages', ['session_id'], {
      name: 'idx_chatbot_messages_session_id'
    });

    await queryInterface.addIndex('chatbot_messages', ['created_at'], {
      name: 'idx_chatbot_messages_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chatbot_messages');
  }
};