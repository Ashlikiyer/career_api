module.exports = (sequelize, DataTypes) => {
    const SavedCareer = sequelize.define('SavedCareer', {
      saved_career_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      career_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      saved_at: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'saved_careers',
      timestamps: false,
    });
  
    SavedCareer.associate = (models) => {
      SavedCareer.belongsTo(models.User, { foreignKey: 'user_id' });
      SavedCareer.hasMany(models.CareerRoadmap, { foreignKey: 'saved_career_id' });
    };
  
    return SavedCareer;
  };