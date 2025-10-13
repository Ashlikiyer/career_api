const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const chatbotHistoryController = require('../controllers/chatbotHistoryController');
const auth = require('../middleware/auth');

// Public chatbot endpoints (no auth required for basic functionality)
// POST /api/chatbot/ask - Ask the IT career chatbot a question
router.post('/ask', chatbotController.getChatbotResponse);

// POST /api/chatbot/chat - Enhanced chatbot with session support (matches frontend expectations)
router.post('/chat', chatbotController.getChatbotResponse);

// GET /api/chatbot/suggestions - Get suggested questions
router.get('/suggestions', chatbotController.getChatbotSuggestions);

// Chat history endpoints (require authentication)
// GET /api/chatbot/sessions - List user's chat sessions
router.get('/sessions', auth, chatbotHistoryController.getUserSessions);

// POST /api/chatbot/sessions - Create new chat session
router.post('/sessions', auth, chatbotHistoryController.createSession);

// GET /api/chatbot/sessions/:sessionUUID/messages - Get session messages
router.get('/sessions/:sessionUUID/messages', auth, chatbotHistoryController.getSessionMessages);

// POST /api/chatbot/sessions/:sessionUUID/messages - Add message to session
router.post('/sessions/:sessionUUID/messages', auth, chatbotHistoryController.addMessageToSession);

// PATCH /api/chatbot/sessions/:sessionUUID - Update session title
router.patch('/sessions/:sessionUUID', auth, chatbotHistoryController.updateSessionTitle);

// DELETE /api/chatbot/sessions/:sessionUUID - Delete chat session
router.delete('/sessions/:sessionUUID', auth, chatbotHistoryController.deleteSession);

module.exports = router;