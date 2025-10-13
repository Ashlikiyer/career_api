#!/usr/bin/env node

/**
 * Chat History System Test Script
 * 
 * This script tests all the new chat history endpoints to ensure they work correctly.
 * Run this after starting the server to validate the implementation.
 * 
 * Usage: node test_chat_history.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (make sure this user exists in your database)
const TEST_USER = {
    email: 'test@example.com',
    password: 'testpassword123'
};

let authToken = '';
let testSessionUUID = '';

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };
    
    if (data) {
        config.data = data;
    }
    
    try {
        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
};

// Test functions
const testLogin = async () => {
    console.log('\n🔐 Testing User Login...');
    const result = await apiRequest('POST', '/auth/login', TEST_USER);
    
    if (result.success && result.data.token) {
        authToken = result.data.token;
        console.log('✅ Login successful');
        return true;
    } else {
        console.log('❌ Login failed:', result.error);
        return false;
    }
};

const testCreateSession = async () => {
    console.log('\n📝 Testing Create Chat Session...');
    const result = await apiRequest('POST', '/chatbot/sessions', {
        title: 'Test Chat Session'
    });
    
    if (result.success && result.data.session) {
        testSessionUUID = result.data.session.session_uuid;
        console.log('✅ Session created:', testSessionUUID);
        return true;
    } else {
        console.log('❌ Session creation failed:', result.error);
        return false;
    }
};

const testGetSessions = async () => {
    console.log('\n📋 Testing Get User Sessions...');
    const result = await apiRequest('GET', '/chatbot/sessions?limit=10&offset=0');
    
    if (result.success && result.data.sessions) {
        console.log(`✅ Retrieved ${result.data.sessions.length} sessions`);
        console.log('Session list:', result.data.sessions.map(s => ({
            uuid: s.session_uuid,
            title: s.title,
            message_count: s.message_count
        })));
        return true;
    } else {
        console.log('❌ Get sessions failed:', result.error);
        return false;
    }
};

const testSendMessage = async () => {
    console.log('\n💬 Testing Send Chatbot Message...');
    const result = await apiRequest('POST', '/chatbot/chat', {
        message: 'What are the career opportunities in software development?',
        session_uuid: testSessionUUID
    });
    
    if (result.success && result.data.response) {
        console.log('✅ Message sent and response received');
        console.log('Response type:', result.data.response_type);
        console.log('Response preview:', result.data.response.substring(0, 100) + '...');
        return true;
    } else {
        console.log('❌ Send message failed:', result.error);
        return false;
    }
};

const testGetSessionMessages = async () => {
    console.log('\n📖 Testing Get Session Messages...');
    const result = await apiRequest('GET', `/chatbot/sessions/${testSessionUUID}/messages`);
    
    if (result.success && result.data.messages) {
        console.log(`✅ Retrieved ${result.data.messages.length} messages from session`);
        result.data.messages.forEach((msg, idx) => {
            console.log(`  ${idx + 1}. [${msg.message_type}] ${msg.content.substring(0, 50)}...`);
        });
        return true;
    } else {
        console.log('❌ Get session messages failed:', result.error);
        return false;
    }
};

const testUpdateSessionTitle = async () => {
    console.log('\n✏️ Testing Update Session Title...');
    const newTitle = 'Updated Test Session - Software Development';
    const result = await apiRequest('PUT', `/chatbot/sessions/${testSessionUUID}`, {
        title: newTitle
    });
    
    if (result.success && result.data.session) {
        console.log('✅ Session title updated to:', result.data.session.title);
        return true;
    } else {
        console.log('❌ Update session title failed:', result.error);
        return false;
    }
};

const testDeleteSession = async () => {
    console.log('\n🗑️ Testing Delete Session...');
    const result = await apiRequest('DELETE', `/chatbot/sessions/${testSessionUUID}`);
    
    if (result.success) {
        console.log('✅ Session deleted successfully');
        return true;
    } else {
        console.log('❌ Delete session failed:', result.error);
        return false;
    }
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting Chat History System Tests');
    console.log('=====================================');
    
    const tests = [
        { name: 'Login', fn: testLogin, critical: true },
        { name: 'Create Session', fn: testCreateSession, critical: true },
        { name: 'Get Sessions', fn: testGetSessions, critical: false },
        { name: 'Send Message', fn: testSendMessage, critical: true },
        { name: 'Get Session Messages', fn: testGetSessionMessages, critical: false },
        { name: 'Update Session Title', fn: testUpdateSessionTitle, critical: false },
        { name: 'Delete Session', fn: testDeleteSession, critical: false }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await test.fn();
        if (result) {
            passed++;
        } else {
            failed++;
            if (test.critical) {
                console.log(`\n❌ Critical test "${test.name}" failed. Stopping tests.`);
                break;
            }
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Chat History system is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the error messages above.');
    }
};

// Handle command line execution
if (require.main === module) {
    runTests().catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = { runTests };