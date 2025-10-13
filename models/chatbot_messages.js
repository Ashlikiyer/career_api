module.exports = (sequelize, DataTypes) => {
const ChatbotMessage = sequelize.define('ChatbotMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chatbot_sessions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  message_type: {
    type: DataTypes.ENUM('user', 'bot'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  career: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'chatbot_messages',
  timestamps: false,
  indexes: [
    {
      fields: ['session_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

  // Define associations
  ChatbotMessage.associate = function(models) {
    // A message belongs to a session
    ChatbotMessage.belongsTo(models.ChatbotSession, {
      foreignKey: 'session_id',
      as: 'session'
    });
  };

  return ChatbotMessage;
};