import { io, Socket } from "socket.io-client";

// Define types for user data and other socket events
interface UserData {
  name: string;
  avatar: string;
  status?: string;
}

interface TaskData {
  id?: string;
  title: string;
  description: string;
  status?: string;
}

interface MessageData {
  text: string;
}

interface TaskMoveData {
  taskId: string;
  newStatus: string;
}

class SocketService {
  private socket: Socket | null;
  private serverUrl: string;

  constructor() {
    this.socket = null;
    this.serverUrl = "http://localhost:3001";
  }

  connect(): Socket | null {
    if (!this.socket) {
      this.socket = io(this.serverUrl);
      console.log("Socket.io initialized");
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket.io disconnected");
    }
  }

  getSocketId(): string | null | undefined {
    return this.socket ? this.socket.id : null;
  }

  // Event listeners
  onConnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on("connect", callback);
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on("disconnect", callback);
    }
  }

  onWorkspaceUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("workspace:update", callback);
    }
  }

  onUserTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ): void {
    if (this.socket) {
      this.socket.on("user:typing", callback);
    }
  }

  // Emit events
  joinWorkspace(userData: UserData): void {
    if (this.socket) {
      this.socket.emit("user:join", userData);
    }
  }

  updateStatus(status: string): void {
    if (this.socket) {
      this.socket.emit("user:status", status);
    }
  }

  createTask(taskData: TaskData): void {
    if (this.socket) {
      this.socket.emit("task:create", taskData);
    }
  }

  updateTask(taskData: TaskData): void {
    if (this.socket) {
      this.socket.emit("task:update", taskData);
    }
  }

  moveTask(taskId: string, newStatus: string): void {
    if (this.socket) {
      this.socket.emit("task:move", { taskId, newStatus } as TaskMoveData);
    }
  }

  sendMessage(message: string): void {
    if (this.socket) {
      this.socket.emit("message:send", { text: message } as MessageData);
    }
  }

  setTyping(isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit("user:typing", isTyping);
    }
  }
}

// Export as a singleton
export const socketService = new SocketService();
