let io;

const setupSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join user to their room (for notifications)
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join event room (for live event updates)
    socket.on('join-event-room', (eventId) => {
      socket.join(`event-${eventId}`);
      console.log(`User joined event room: ${eventId}`);
    });

    // Leave event room
    socket.on('leave-event-room', (eventId) => {
      socket.leave(`event-${eventId}`);
      console.log(`User left event room: ${eventId}`);
    });

    // Handle live event streaming
    socket.on('start-live-stream', (data) => {
      socket.to(`event-${data.eventId}`).emit('live-stream-started', {
        eventId: data.eventId,
        streamUrl: data.streamUrl,
        message: 'Live stream has started!'
      });
    });

    socket.on('end-live-stream', (data) => {
      socket.to(`event-${data.eventId}`).emit('live-stream-ended', {
        eventId: data.eventId,
        message: 'Live stream has ended.'
      });
    });

    // Handle real-time notifications
    socket.on('send-notification', (data) => {
      if (data.userId) {
        socket.to(`user-${data.userId}`).emit('notification', data);
      } else if (data.broadcast) {
        socket.broadcast.emit('notification', data);
      }
    });

    // Handle event updates
    socket.on('event-update', (data) => {
      socket.to(`event-${data.eventId}`).emit('event-updated', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Utility functions to emit events from other parts of the application
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

const emitToEventRoom = (eventId, event, data) => {
  if (io) {
    io.to(`event-${eventId}`).emit(event, data);
  }
};

const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  setupSocket,
  emitToUser,
  emitToEventRoom,
  broadcastToAll
};