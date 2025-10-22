module.exports = (sequelize, DataTypes) => {
  const Roadmap = sequelize.define('Roadmap', {
    roadmap_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    career_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_steps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'roadmaps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Roadmap.associate = (models) => {
    Roadmap.hasMany(models.RoadmapStep, {
      foreignKey: 'roadmap_id',
      as: 'steps'
    });
  };

  return Roadmap;
};