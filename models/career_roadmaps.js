module.exports = (sequelize, DataTypes) => {
  const CareerRoadmap = sequelize.define('CareerRoadmap', {
    roadmap_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    saved_career_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    step_order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    step_descriptions: { // Database column name is plural
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'career_roadmaps',
    timestamps: false,
  });

  CareerRoadmap.associate = (models) => {
    CareerRoadmap.belongsTo(models.SavedCareer, { foreignKey: 'saved_career_id' });
  };

  return CareerRoadmap;
};