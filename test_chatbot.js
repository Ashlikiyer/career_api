const BASE_URL = 'http://localhost:5000';

async function testChatbot() {
  console.log('🤖 Testing IT Career Chatbot...\n');

  try {
    // Test 1: Get suggestions
    console.log('📋 Test 1: Getting suggestions...');
    const suggestionsResponse = await fetch(`${BASE_URL}/api/chatbot/suggestions`);
    const suggestionsData = await suggestionsResponse.json();
    console.log('✅ Suggestions loaded:', suggestionsData.suggestions.length, 'suggestions');
    console.log('Categories:', suggestionsData.categories);
    console.log();

    // Test 2: Ask IT-related question (career specific)
    console.log('💼 Test 2: Asking about Software Engineer...');
    const careerResponse = await fetch(`${BASE_URL}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is a Software Engineer?' })
    });
    const careerData = await careerResponse.json();
    console.log('✅ Response type:', careerData.type);
    console.log('Career info:', careerData.career || 'N/A');
    console.log('Response preview:', careerData.response.substring(0, 100) + '...');
    console.log();

    // Test 3: Ask general IT question
    console.log('🔧 Test 3: Asking general IT question...');
    const generalResponse = await fetch(`${BASE_URL}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What are the top programming languages to learn?' })
    });
    const generalData = await generalResponse.json();
    console.log('✅ Response type:', generalData.type);
    console.log('Response preview:', generalData.response.substring(0, 100) + '...');
    console.log();

    // Test 4: Ask non-IT question (should be filtered)
    console.log('🚫 Test 4: Asking non-IT question...');
    const nonITResponse = await fetch(`${BASE_URL}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'How to cook pasta?' })
    });
    const nonITData = await nonITResponse.json();
    console.log('✅ Response type:', nonITData.type);
    console.log('Response preview:', nonITData.response.substring(0, 100) + '...');
    console.log();

    // Test 5: Ask about Data Science
    console.log('📊 Test 5: Asking about Data Science...');
    const dataResponse = await fetch(`${BASE_URL}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Tell me about Data Scientist career' })
    });
    const dataData = await dataResponse.json();
    console.log('✅ Response type:', dataData.type);
    console.log('Career info:', dataData.career || 'N/A');
    console.log('Response preview:', dataData.response.substring(0, 100) + '...');

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testChatbot();