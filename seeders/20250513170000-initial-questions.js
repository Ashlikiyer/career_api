'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('questions', [
      {
        question_id: 1,
        question_text: 'What do you enjoy doing most?',
        options_answer: 'Coding,Designing,Data Analysis,Testing',
        career_category: 'default',
      },
      {
        question_id: 2,
        question_text: 'What do you enjoy doing next?',
        options_answer: 'Yes, I like programming,Yes, I like designing websites,Yes, I like data manipulation,Yes, I like testing websites',
        career_category: 'follow-up',
      },
      {
        question_id: 3,
        question_text: 'Do you enjoy problem-solving?',
        options_answer: 'Yes, I enjoy problem-solving,Yes, I enjoy creativity,Yes, I enjoy working with numbers,Yes, I enjoy finding bugs',
        career_category: 'follow-up',
      },
      {
        question_id: 4,
        question_text: 'Do you like working with data structures?',
        options_answer: 'Yes, I prefer working with technology,Yes, I prefer visual arts,Yes, I prefer statistics,Yes, I prefer ensuring quality',
        career_category: 'follow-up',
      },
      {
        question_id: 5,
        question_text: 'Are you interested in learning new programming languages?',
        options_answer: 'Yes, I’m interested in learning new languages,Yes, I’m comfortable with design software,Yes, I’m familiar with machine learning,Yes, I’m detail-oriented',
        career_category: 'follow-up',
      },
      {
        question_id: 6,
        question_text: 'Are you comfortable with debugging?',
        options_answer: 'Yes, I’m comfortable with debugging,Yes, I enjoy working with clients,Yes, I enjoy creating visualizations,Yes, I enjoy working on quality assurance',
        career_category: 'follow-up',
      },
      {
        question_id: 7,
        question_text: 'How do you prefer to collaborate?',
        options_answer: 'Yes, I enjoy coding with a team,Yes, I enjoy designing with feedback,Yes, I enjoy analyzing data with others,Yes, I enjoy testing with peers',
        career_category: 'follow-up',
      },
      {
        question_id: 8,
        question_text: 'What motivates you most in your work?',
        options_answer: 'Yes, solving complex problems,Yes, creating beautiful designs,Yes, discovering insights from data,Yes, ensuring perfect results',
        career_category: 'follow-up',
      },
      {
        question_id: 9,
        question_text: 'What long-term goal excites you?',
        options_answer: 'Yes, building innovative software,Yes, mastering design trends,Yes, advancing data science,Yes, perfecting testing processes',
        career_category: 'follow-up',
      },
      {
        question_id: 10,
        question_text: 'What learning style do you prefer?',
        options_answer: 'Yes, I prefer hands-on coding,Yes, I prefer visual design tutorials,Yes, I prefer data-driven courses,Yes, I prefer structured testing guides',
        career_category: 'follow-up',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('questions', { question_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, {});
  },
};