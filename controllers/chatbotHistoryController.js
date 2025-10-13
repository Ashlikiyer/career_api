const chatbotHistoryService = require('../services/chatbotHistoryService');

// GET /api/chatbot/sessions - List user's chat sessions
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { limit, offset } = req.query;
    const options = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    };

    const result = await chatbotHistoryService.getUserSessions(userId, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve chat sessions'
    });
  }
};

// POST /api/chatbot/sessions - Create new chat session
const createSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { title } = req.body;
    const session = await chatbotHistoryService.createSession(userId, title);

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to create chat session'
    });
  }
};

// GET /api/chatbot/sessions/:sessionUUID/messages - Get session messages
const getSessionMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { sessionUUID } = req.params;
    const { limit, offset } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    };

    const result = await chatbotHistoryService.getSessionMessages(sessionUUID, userId, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get session messages error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'The requested chat session was not found or has been deleted'
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve session messages'
    });
  }
};

// POST /api/chatbot/sessions/:sessionUUID/messages - Add message to session
const addMessageToSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { sessionUUID } = req.params;
    const { message_type, content, response_type, career, metadata } = req.body;

    // Validation
    if (!message_type || !content) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'message_type and content are required',
        details: {
          required_fields: ['message_type', 'content']
        }
      });
    }

    if (!['user', 'bot'].includes(message_type)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid message_type',
        details: {
          field: 'message_type',
          issue: 'Must be either "user" or "bot"'
        }
      });
    }

    const messageData = {
      message_type,
      content,
      response_type: response_type || null,
      career: career || null,
      metadata: metadata || null
    };

    const message = await chatbotHistoryService.addMessage(sessionUUID, userId, messageData);

    res.status(201).json({
      success: true,
      message,
      session_updated: true
    });
  } catch (error) {
    console.error('Add message error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'The requested chat session was not found or has been deleted'
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to add message to session'
    });
  }
};

// PATCH /api/chatbot/sessions/:sessionUUID - Update session title
const updateSessionTitle = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { sessionUUID } = req.params;
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Valid title is required',
        details: {
          field: 'title',
          issue: 'Must be a non-empty string'
        }
      });
    }

    const session = await chatbotHistoryService.updateSessionTitle(sessionUUID, userId, title);

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Update session title error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'The requested chat session was not found or has been deleted'
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to update session title'
    });
  }
};

// DELETE /api/chatbot/sessions/:sessionUUID - Delete chat session
const deleteSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const { sessionUUID } = req.params;

    await chatbotHistoryService.deleteSession(sessionUUID, userId);

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'The requested chat session was not found or has been deleted'
      });
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to delete chat session'
    });
  }
};

module.exports = {
  getUserSessions,
  createSession,
  getSessionMessages,
  addMessageToSession,
  updateSessionTitle,
  deleteSession
};