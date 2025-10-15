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
      {
        question_id: 11,
        question_text: 'Which type of project would you be most excited to work on?',
        options_answer: 'Building scalable web applications,Creating user-friendly mobile interfaces,Analyzing customer behavior patterns,Ensuring software meets quality standards',
        career_category: 'follow-up',
      },
      {
        question_id: 12,
        question_text: 'What type of technical challenge energizes you most?',
        options_answer: 'Optimizing code performance,Improving user experience design,Building predictive models,Finding and fixing software bugs',
        career_category: 'follow-up',
      },
      {
        question_id: 13,
        question_text: 'Which skill development area interests you most?',
        options_answer: 'Learning new programming languages,Mastering design tools and principles,Exploring machine learning algorithms,Developing testing methodologies',
        career_category: 'follow-up',
      },
      {
        question_id: 14,
        question_text: 'What type of problem-solving approach do you prefer?',
        options_answer: 'Systematic coding and debugging,Creative brainstorming for design solutions,Data-driven hypothesis testing,Methodical testing and validation',
        career_category: 'follow-up',
      },
      {
        question_id: 15,
        question_text: 'Which aspect of technology excites you most?',
        options_answer: 'Building robust software architecture,Crafting intuitive user interfaces,Discovering insights from data,Ensuring software reliability',
        career_category: 'follow-up',
      },
      {
        question_id: 16,
        question_text: 'What motivates you to learn new technologies?',
        options_answer: 'Implementing efficient solutions,Creating better user experiences,Leveraging data for insights,Improving software quality',
        career_category: 'follow-up',
      },
      {
        question_id: 17,
        question_text: 'Which type of feedback do you find most valuable?',
        options_answer: 'Code review and technical suggestions,User feedback on design prototypes,Statistical validation of analysis results,Bug reports and testing outcomes',
        career_category: 'follow-up',
      },
      {
        question_id: 18,
        question_text: 'What type of documentation do you prefer creating?',
        options_answer: 'Technical specifications and API docs,Design guidelines and user personas,Data analysis reports and visualizations,Test cases and quality reports',
        career_category: 'follow-up',
      },
      {
        question_id: 19,
        question_text: 'Which success metric would you be most proud of?',
        options_answer: 'High-performance application with minimal downtime,Increased user engagement and satisfaction,Actionable insights leading to business growth,Zero critical bugs in production',
        career_category: 'follow-up',
      },
      {
        question_id: 20,
        question_text: 'What type of continuous learning appeals to you most?',
        options_answer: 'Staying updated with programming frameworks,Following design trends and user research,Exploring new data science techniques,Learning about quality assurance best practices',
        career_category: 'follow-up',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('questions', { question_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] }, {});
  },
};