const { io } = require("../server");

class SocketService {
  static emitStatusUpdate(data) {
    io.emit("status-update", data);
  }

  static emitToUser(userId, event, data) {
    io.to(userId).emit(event, data);
  }

  static broadcastEvent(event, data) {
    io.emit(event, data);
  }
}

module.exports = SocketService;
