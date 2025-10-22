'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserFeedback = sequelize.define('user_feedback', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow anonymous feedback
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    assessment_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow feedback without specific assessment reference
      references: {
        model: 'assessments',
        key: 'assessment_id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        isInt: true
      }
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: true // Optional text feedback
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['assessment_id']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Define associations
  UserFeedback.associate = function(models) {
    // A feedback belongs to a user (optional)
    UserFeedback.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // A feedback belongs to an assessment (optional)
    UserFeedback.belongsTo(models.Assessment, {
      foreignKey: 'assessment_id',
      as: 'assessment'
    });
  };

  return UserFeedback;
};