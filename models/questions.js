'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.hasMany(models.InitialResult, { foreignKey: 'question_id' });
    }
  }

  Question.init({
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
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Question;
};