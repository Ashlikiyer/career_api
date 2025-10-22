module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'users',
      timestamps: false,
    });
  
    User.associate = (models) => {
      User.hasOne(models.Profile, { foreignKey: 'user_id' });
      User.hasMany(models.FinalResult, { foreignKey: 'user_id' });
      User.hasMany(models.SavedCareer, { foreignKey: 'user_id' });
      User.hasMany(models.user_feedback, { foreignKey: 'user_id' });
    };
  
    return User;
  };