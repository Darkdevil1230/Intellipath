const MentorChat = require('../models/MentorChat');

const setupMentorChat = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', (bookingId) => {
      socket.join(bookingId);
      console.log(`User joined room: ${bookingId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { bookingId, sender, content } = data;

      try {
        let chat = await MentorChat.findOne({ booking: bookingId });

        if (!chat) {
          chat = await MentorChat.create({
            booking: bookingId,
            participants: [sender],
            messages: [],
          });
        }

        chat.messages.push({
          sender,
          content,
          timestamp: new Date(),
        });

        await chat.save();

        io.to(bookingId).emit('receiveMessage', {
          sender,
          content,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('typing', (data) => {
      const { bookingId, sender } = data;
      socket.to(bookingId).emit('userTyping', { sender });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupMentorChat;
