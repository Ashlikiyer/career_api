module.exports = (sequelize, DataTypes) => {
    const InitialResult = sequelize.define('InitialResult', {
      answer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      selected_option: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'initial_results',
      timestamps: false,
    });
  
    InitialResult.associate = (models) => {
      InitialResult.belongsTo(models.Question, { foreignKey: 'question_id' });
    };
  
    return InitialResult;
  };