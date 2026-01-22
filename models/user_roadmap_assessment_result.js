const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserRoadmapAssessmentResult = sequelize.define('UserRoadmapAssessmentResult', {
    result_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    roadmap_assessment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roadmap_assessments',
        key: 'assessment_id'
      }
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    pass_fail_status: {
      type: DataTypes.ENUM('pass', 'fail', 'in_progress'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    attempt_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true
    },
    time_taken_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'user_roadmap_assessment_results',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserRoadmapAssessmentResult.associate = (models) => {
    // Belongs to User
    UserRoadmapAssessmentResult.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Belongs to RoadmapAssessment
    UserRoadmapAssessmentResult.belongsTo(models.RoadmapAssessment, {
      foreignKey: 'roadmap_assessment_id',
      as: 'assessment'
    });
  };

  return UserRoadmapAssessmentResult;
};
