import { io, Socket } from "socket.io-client";

// Define types for user data and other socket events
export interface UserData {
  name: string;
  avatar: string;
  status?: string;
  userId?: string; // Add optional userId for reconnection
}

export interface TaskData {
  id?: string;
  title: string;
  description: string;
  status?: string;
  assigneeId?: string; // Add support for assignee
}

interface TypingData {
  userId: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null;
  private serverUrl: string;

  constructor() {
    this.socket = null;
    this.serverUrl = "http://localhost:3001";
  }

  init(): Socket | null {
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

  onConnect(callback: () => void): void {
    if (!this.socket) this.init();
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

  onTyping(callback: (data: TypingData) => void): void {
    if (this.socket) {
      this.socket.on("user:typing", callback);
    }
  }

  // Handle persistent user ID
  onUserId(callback: (userId: string) => void): void {
    if (this.socket) {
      this.socket.on("user:id", callback);
    }
  }

  // Emit events
  joinWorkspace(userData: UserData): void {
    if (!this.socket) this.init();
    if (this.socket) {
      this.socket.emit("user:join", userData);
    }
  }

  updateStatus(status: string): void {
    if (this.socket) {
      this.socket.emit("user:status", status);
    }
  }

  createTask(taskData: Omit<TaskData, 'id'>): void {
    if (this.socket) {
      this.socket.emit("task:create", taskData);
    }
  }

  updateTask(taskData: { id: string } & Partial<TaskData>): void {
    if (this.socket) {
      this.socket.emit("task:update", taskData);
    }
  }

  moveTask(taskId: string, newStatus: string): void {
    if (this.socket) {
      this.socket.emit("task:move", { taskId, newStatus });
    }
  }

  sendMessage(text: string): void {
    if (this.socket) {
      this.socket.emit("message:send", { text });
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
