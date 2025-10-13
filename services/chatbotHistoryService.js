const { ChatbotSession, ChatbotMessage } = require('../models');
const { Op } = require('sequelize');

// Generate unique session UUID
const generateSessionUUID = (userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `sess_${userId}_${timestamp}_${random}`;
};

// Auto-generate title from first user message
const generateAutoTitle = (firstMessage) => {
  if (!firstMessage || typeof firstMessage !== 'string') {
    const now = new Date();
    return `New Chat ${now.toLocaleDateString()}`;
  }
  
  // Clean and truncate the message
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
  return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
};

// Get user's chat sessions with pagination
const getUserSessions = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  const maxLimit = Math.min(limit, 50);

  try {
    const { count, rows } = await ChatbotSession.findAndCountAll({
      where: {
        user_id: userId,
        is_deleted: false
      },
      attributes: [
        'id', 
        'session_uuid', 
        'title', 
        'created_at', 
        'last_active'
      ],
      order: [['last_active', 'DESC']],
      limit: maxLimit,
      offset: parseInt(offset),
      include: [{
        model: ChatbotMessage,
        as: 'messages',
        attributes: [],
        required: false
      }]
    });

    // Get message counts for each session
    const sessionsWithCount = await Promise.all(
      rows.map(async (session) => {
        const messageCount = await ChatbotMessage.count({
          where: { session_id: session.id }
        });
        
        return {
          id: session.id,
          session_uuid: session.session_uuid,
          title: session.title,
          created_at: session.created_at,
          last_active: session.last_active,
          message_count: messageCount
        };
      })
    );

    return {
      sessions: sessionsWithCount,
      pagination: {
        total: count,
        limit: maxLimit,
        offset: parseInt(offset),
        has_more: count > (parseInt(offset) + maxLimit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get user sessions: ${error.message}`);
  }
};

// Create new chat session
const createSession = async (userId, title = null) => {
  try {
    const sessionUUID = generateSessionUUID(userId);
    const sessionTitle = title || 'New Chat';

    const session = await ChatbotSession.create({
      user_id: userId,
      session_uuid: sessionUUID,
      title: sessionTitle,
      created_at: new Date(),
      last_active: new Date()
    });

    return {
      id: session.id,
      session_uuid: session.session_uuid,
      title: session.title,
      created_at: session.created_at,
      last_active: session.last_active,
      message_count: 0
    };
  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

// Get session with messages
const getSessionMessages = async (sessionUUID, userId, options = {}) => {
  const { limit = 50, offset = 0 } = options;
  const maxLimit = Math.min(limit, 100);

  try {
    // First verify session belongs to user
    const session = await ChatbotSession.findOne({
      where: {
        session_uuid: sessionUUID,
        user_id: userId,
        is_deleted: false
      }
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    // Get messages with pagination
    const { count, rows } = await ChatbotMessage.findAndCountAll({
      where: { session_id: session.id },
      attributes: [
        'id',
        'message_type',
        'content',
        'response_type',
        'career',
        'created_at',
        'metadata'
      ],
      order: [['created_at', 'ASC']],
      limit: maxLimit,
      offset: parseInt(offset)
    });

    return {
      session: {
        id: session.id,
        session_uuid: session.session_uuid,
        title: session.title,
        created_at: session.created_at,
        last_active: session.last_active
      },
      messages: rows,
      pagination: {
        total: count,
        limit: maxLimit,
        offset: parseInt(offset),
        has_more: count > (parseInt(offset) + maxLimit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get session messages: ${error.message}`);
  }
};

// Add message to session
const addMessage = async (sessionUUID, userId, messageData) => {
  try {
    // Verify session belongs to user
    const session = await ChatbotSession.findOne({
      where: {
        session_uuid: sessionUUID,
        user_id: userId,
        is_deleted: false
      }
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    // Create the message
    const message = await ChatbotMessage.create({
      session_id: session.id,
      message_type: messageData.message_type,
      content: messageData.content,
      response_type: messageData.response_type || null,
      career: messageData.career || null,
      created_at: new Date(),
      metadata: messageData.metadata || null
    });

    // Update session last_active timestamp
    await session.update({
      last_active: new Date()
    });

    // Auto-update title if this is the first user message and title is default
    if (messageData.message_type === 'user' && 
        (session.title === 'New Chat' || session.title.startsWith('New Chat '))) {
      const autoTitle = generateAutoTitle(messageData.content);
      await session.update({ title: autoTitle });
    }

    return {
      id: message.id,
      message_type: message.message_type,
      content: message.content,
      response_type: message.response_type,
      career: message.career,
      created_at: message.created_at,
      metadata: message.metadata
    };
  } catch (error) {
    throw new Error(`Failed to add message: ${error.message}`);
  }
};

// Update session title
const updateSessionTitle = async (sessionUUID, userId, newTitle) => {
  try {
    const session = await ChatbotSession.findOne({
      where: {
        session_uuid: sessionUUID,
        user_id: userId,
        is_deleted: false
      }
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    await session.update({
      title: newTitle.trim().substring(0, 500), // Ensure title length limit
      last_active: new Date()
    });

    return {
      id: session.id,
      session_uuid: session.session_uuid,
      title: session.title,
      created_at: session.created_at,
      last_active: session.last_active
    };
  } catch (error) {
    throw new Error(`Failed to update session title: ${error.message}`);
  }
};

// Delete session
const deleteSession = async (sessionUUID, userId) => {
  try {
    const session = await ChatbotSession.findOne({
      where: {
        session_uuid: sessionUUID,
        user_id: userId,
        is_deleted: false
      }
    });

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    // Soft delete the session
    await session.update({ is_deleted: true });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete session: ${error.message}`);
  }
};

// Find or create session for chatbot ask endpoint
const findOrCreateSessionForAsk = async (sessionUUID, userId) => {
  if (!sessionUUID) {
    return null; // No session requested
  }

  try {
    const session = await ChatbotSession.findOne({
      where: {
        session_uuid: sessionUUID,
        user_id: userId,
        is_deleted: false
      }
    });

    return session;
  } catch (error) {
    throw new Error(`Failed to find session: ${error.message}`);
  }
};

module.exports = {
  generateSessionUUID,
  generateAutoTitle,
  getUserSessions,
  createSession,
  getSessionMessages,
  addMessage,
  updateSessionTitle,
  deleteSession,
  findOrCreateSessionForAsk
};