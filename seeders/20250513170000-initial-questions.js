'use strict';

const questionsData = require('../careerdata/questions.json');

// Build complete questions array with descriptions
function buildQuestionsWithDescriptions() {
  const questionsArray = [];
  
  // Add default question
  if (questionsData.default_question) {
    questionsArray.push(questionsData.default_question);
  }
  
  // Add progressive questions
  if (questionsData.progressive_questions && Array.isArray(questionsData.progressive_questions)) {
    questionsArray.push(...questionsData.progressive_questions);
  }
  
  console.log(`Found ${questionsArray.length} questions to seed`);
  
  // Convert to seeder format
  const processedQuestions = questionsArray.map(q => {
    console.log(`Processing question ${q.question_id}: ${q.question_text.substring(0, 50)}...`);
    return {
      question_id: q.question_id,
      question_text: q.question_text,
      options_answer: q.options_answer,
      options_descriptions: q.options_descriptions ? JSON.stringify(q.options_descriptions) : null,
      career_category: q.career_category || 'follow-up',
      created_at: new Date(),
      updated_at: new Date()
    };
  });
  
  return processedQuestions;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('📋 Loading questions data...');
    
    try {
      const questionsWithDescriptions = buildQuestionsWithDescriptions();
      
      if (!questionsWithDescriptions || questionsWithDescriptions.length === 0) {
        console.error('❌ No questions to seed!');
        return;
      }
      
      console.log(`🌱 Seeding ${questionsWithDescriptions.length} questions with descriptions...`);
      
      await queryInterface.bulkInsert('questions', questionsWithDescriptions, {
        ignoreDuplicates: true
      });
      
      console.log('✅ Questions seeded with tooltip descriptions preserved!');
    } catch (error) {
      console.error('❌ Seeding error:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('questions', { 
      question_id: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] 
    }, {});
  },
};