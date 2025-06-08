'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assessment extends Model {
    static associate(models) {
      Assessment.hasMany(models.Question, { foreignKey: 'assessment_id' });
      Assessment.hasMany(models.InitialResult, { foreignKey: 'assessment_id' });
      Assessment.hasMany(models.FinalResult, { foreignKey: 'assessment_id' });
    }
  }

  Assessment.init({
    assessment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Assessment',
    tableName: 'assessments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Assessment;
};