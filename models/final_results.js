'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FinalResult extends Model {
    static associate(models) {
      FinalResult.belongsTo(models.Assessment, { foreignKey: 'assessment_id' });
      FinalResult.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  FinalResult.init({
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
    sequelize,
    modelName: 'FinalResult',
    tableName: 'final_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return FinalResult;
};