module.exports = (sequelize, DataTypes) => {
  const Assessment = sequelize.define('Assessment', {
    assessmentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'assessmentid' // Match the lowercase column name in the database
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'assessment',
    timestamps: false
  });

  Assessment.associate = (models) => {
    Assessment.hasMany(models.FinalResult, { foreignKey: 'assessment_id' });
    Assessment.hasMany(models.InitialResult, { foreignKey: 'assessment_id' });
  };

  return Assessment;
};