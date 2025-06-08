module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('questions', 'assessment_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment',
        key: 'assessmentid'
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('questions', 'assessment_id');
  }
};