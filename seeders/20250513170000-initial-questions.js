'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('questions', [
      {
        question_id: 1,
        question_text: 'What do you enjoy doing most?',
        options_answer: 'Coding,Designing,Data Analysis,Testing,User Experience,Infrastructure',
        career_category: 'default',
      },
      {
        question_id: 2,
        question_text: 'What do you enjoy doing next?',
        options_answer: 'Yes, I like programming,Yes, I like designing websites,Yes, I like data manipulation,Yes, I like testing websites,Yes, I like designing user interfaces,Yes, I like managing servers',
        career_category: 'follow-up',
      },
      {
        question_id: 3,
        question_text: 'Do you enjoy problem-solving?',
        options_answer: 'Yes, I enjoy problem-solving,No, I prefer creative tasks',
        career_category: 'follow-up',
      },
      {
        question_id: 4,
        question_text: 'Do you like working with data structures?',
        options_answer: 'Yes, I like working with data structures,No, I prefer visual design',
        career_category: 'follow-up',
      },
      {
        question_id: 5,
        question_id: 5,
        question_text: 'Are you interested in learning new programming languages?',
        options_answer: 'Yes, I’m interested in learning new languages,No, I prefer sticking to what I know',
        career_category: 'follow-up',
      },
      {
        question_id: 6,
        question_text: 'Are you comfortable with debugging?',
        options_answer: 'Yes, I’m comfortable with debugging,No, I find debugging challenging',
        career_category: 'follow-up',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('questions', { question_id: [1, 2, 3, 4, 5, 6] }, {});
  },
};