module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
      question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      options_answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      career_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'questions',
      timestamps: false,
    });
  
    Question.associate = (models) => {
      Question.hasMany(models.InitialResult, { foreignKey: 'question_id' });
    };
  
    return Question;
  };