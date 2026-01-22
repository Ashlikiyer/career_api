module.exports = (sequelize, DataTypes) => {
  const RoadmapStep = sequelize.define('RoadmapStep', {
    step_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roadmap_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    step_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resources: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    weeks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    milestone_project: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
      defaultValue: 'beginner',
      comment: 'Difficulty classification: beginner (easy), intermediate (medium), advanced (hard)'
    },
    is_done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    time_spent_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'roadmap_steps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  RoadmapStep.associate = (models) => {
    RoadmapStep.belongsTo(models.Roadmap, {
      foreignKey: 'roadmap_id',
      as: 'roadmap'
    });
    RoadmapStep.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return RoadmapStep;
};