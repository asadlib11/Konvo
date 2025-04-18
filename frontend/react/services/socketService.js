import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = 'http://localhost:3001';
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.serverUrl);
      console.log('Socket.io initialized');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket.io disconnected');
    }
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Event listeners
  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  onDisconnect(callback) {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  onWorkspaceUpdate(callback) {
    if (this.socket) {
      this.socket.on('workspace:update', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
  }

  // Emit events
  joinWorkspace(userData) {
    if (this.socket) {
      this.socket.emit('user:join', userData);
    }
  }

  updateStatus(status) {
    if (this.socket) {
      this.socket.emit('user:status', status);
    }
  }

  createTask(taskData) {
    if (this.socket) {
      this.socket.emit('task:create', taskData);
    }
  }

  updateTask(taskData) {
    if (this.socket) {
      this.socket.emit('task:update', taskData);
    }
  }

  moveTask(taskId, newStatus) {
    if (this.socket) {
      this.socket.emit('task:move', { taskId, newStatus });
    }
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit('message:send', { text: message });
    }
  }

  setTyping(isTyping) {
    if (this.socket) {
      this.socket.emit('user:typing', isTyping);
    }
  }
}

// Export as a singleton
export const socketService = new SocketService();