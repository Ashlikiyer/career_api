'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InitialResult extends Model {
    static associate(models) {
      InitialResult.belongsTo(models.Assessment, { foreignKey: 'assessment_id' });
      InitialResult.belongsTo(models.Question, { foreignKey: 'question_id' });
    }
  }

  InitialResult.init({
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
    sequelize,
    modelName: 'InitialResult',
    tableName: 'initial_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return InitialResult;
};