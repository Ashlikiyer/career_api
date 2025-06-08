'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('questions', [
      {
        question_id: 1,
        question_text: 'What activity are you most passionate about?',
        options_answer: 'Solving computing problems,Creating visual designs,Analyzing data patterns,Ensuring software quality',
        career_category: 'default',
      },
      {
        question_id: 2,
        question_text: 'Which task do you enjoy the most?',
        options_answer: 'Designing algorithms,Working on creative layouts,Manipulating datasets,Testing software functionality',
        career_category: 'follow-up',
      },
      {
        question_id: 3,
        question_text: 'What type of problem-solving excites you?',
        options_answer: 'Algorithmic challenges,Visual design challenges,Statistical analysis challenges,Debugging challenges',
        career_category: 'follow-up',
      },
      {
        question_id: 4,
        question_text: 'Which work environment suits you best?',
        options_answer: 'Technology-driven projects,Artistic and creative spaces,Data-focused research,Quality assurance processes',
        career_category: 'follow-up',
      },
      {
        question_id: 5,
        question_text: 'Which skill do you want to develop most?',
        options_answer: 'Programming and algorithm design,Design software proficiency,Data modeling and machine learning,Testing and quality assurance techniques',
        career_category: 'follow-up',
      },
      {
        question_id: 6,
        question_text: 'What do you find most rewarding in your work?',
        options_answer: 'Building efficient software,Designing impactful visuals,Uncovering data insights,Ensuring flawless software performance',
        career_category: 'follow-up',
      },
      {
        question_id: 7,
        question_text: 'How do you prefer to work with others?',
        options_answer: 'Collaborating on code development,Collaborating on design feedback,Collaborating on data analysis,Collaborating on testing strategies',
        career_category: 'follow-up',
      },
      {
        question_id: 8,
        question_text: 'What motivates you in your career?',
        options_answer: 'Innovating with technology,Expressing creativity through design,Driving decisions with data,Maintaining high-quality standards',
        career_category: 'follow-up',
      },
      {
        question_id: 9,
        question_text: 'What ethical aspect do you value most?',
        options_answer: 'Ensuring software security,Respecting design ethics,Maintaining data privacy,Promoting software reliability',
        career_category: 'follow-up',
      },
      {
        question_id: 10,
        question_text: 'What long-term learning goal excites you?',
        options_answer: 'Mastering advanced computing techniques,Becoming a design expert,Leading data science innovations,Excelling in quality assurance practices',
        career_category: 'follow-up',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('questions', { question_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, {});
  },
};