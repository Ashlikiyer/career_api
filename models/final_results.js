module.exports = (sequelize, DataTypes) => {
    const FinalResult = sequelize.define('FinalResult', {
      result_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      career_suggestion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'final_results',
      timestamps: false,
    });
  
    FinalResult.associate = (models) => {
      FinalResult.belongsTo(models.User, { foreignKey: 'user_id' });
    };
  
    return FinalResult;
  };