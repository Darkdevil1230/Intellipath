const ChatSession = require('../models/ChatSession');
const { generateChatResponse } = require('../utils/gemini');

const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const user = req.user._id;

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
    } else {
      session = await ChatSession.create({
        user,
        title: message.substring(0, 30) + '...',
      });
    }

    session.messages.push({
      role: 'user',
      content: message,
    });

    const conversationHistory = session.messages;
    const aiResponse = await generateChatResponse(message, conversationHistory);

    session.messages.push({
      role: 'assistant',
      content: aiResponse,
    });

    await session.save();

    res.json({
      sessionId: session._id,
      response: aiResponse,
      messages: session.messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt');

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    
    if (!session || session.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatSession,
  deleteChatSession,
};
