module.exports = (sequelize, DataTypes) => {
const ChatbotSession = sequelize.define('ChatbotSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  session_uuid: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'chatbot_sessions',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['last_active']
    },
    {
      fields: ['session_uuid']
    }
  ]
});

  // Define associations
  ChatbotSession.associate = function(models) {
    // A session belongs to a user
    ChatbotSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'user_id',
      as: 'user'
    });
    
    // A session has many messages
    ChatbotSession.hasMany(models.ChatbotMessage, {
      foreignKey: 'session_id',
      as: 'messages'
    });
  };

  return ChatbotSession;
};