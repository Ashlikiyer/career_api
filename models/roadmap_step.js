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
    is_done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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