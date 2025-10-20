'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.hasMany(models.InitialResult, { foreignKey: 'question_id' });
      Question.belongsTo(models.Assessment, { foreignKey: 'assessment_id' }); // Add this
    }
    
    toJSON() {
      const values = Object.assign({}, this.get());
      // Ensure options_descriptions is properly parsed
      if (values.options_descriptions && typeof values.options_descriptions === 'string') {
        try {
          values.options_descriptions = JSON.parse(values.options_descriptions);
        } catch (e) {
          console.error('Error parsing options_descriptions in toJSON:', e);
          values.options_descriptions = null;
        }
      }
      return values;
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
    options_descriptions: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('options_descriptions');
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('Error parsing options_descriptions JSON:', e);
          return null;
        }
      },
      set(value) {
        this.setDataValue('options_descriptions', value ? JSON.stringify(value) : null);
      }
    },
    career_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assessment_id: { // Add this
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'assessments',
        key: 'assessment_id',
      },
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