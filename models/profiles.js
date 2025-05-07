module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'profiles',
      timestamps: false,
    });
  
    Profile.associate = (models) => {
      Profile.belongsTo(models.User, { foreignKey: 'user_id' });
    };
  
    return Profile;
  };