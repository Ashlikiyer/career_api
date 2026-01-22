const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoadmapAssessment = sequelize.define('RoadmapAssessment', {
    assessment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    roadmap_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'career_roadmaps',
        key: 'roadmap_id'
      }
    },
    step_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    questions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    passing_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 70,
      validate: {
        min: 0,
        max: 100
      }
    },
    time_limit_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'roadmap_assessments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['roadmap_id', 'step_number'],
        name: 'unique_roadmap_step_assessment'
      }
    ]
  });

  RoadmapAssessment.associate = (models) => {
    // Belongs to Roadmap
    RoadmapAssessment.belongsTo(models.Roadmap, {
      foreignKey: 'roadmap_id',
      as: 'roadmap'
    });

    // Has many results
    RoadmapAssessment.hasMany(models.UserRoadmapAssessmentResult, {
      foreignKey: 'roadmap_assessment_id',
      as: 'results'
    });
  };

  return RoadmapAssessment;
};
