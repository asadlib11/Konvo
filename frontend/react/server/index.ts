import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { initialWorkspaceData } from "./mockData";
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastActive: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

interface WorkspaceData {
  users: User[];
  tasks: Task[];
  messages: Message[];
}

interface UserJoinData {
  name: string;
  avatar: string;
  userId?: string;
}

interface TaskCreateData {
  title: string;
  description: string;
  status?: string;
  assigneeId?: string;
}

interface TaskUpdateData {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
}

interface TaskMoveData {
  taskId: string;
  newStatus: string;
}

interface MessageSendData {
  text: string;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Clone the initial data to avoid modifying the original
let workspaceData: WorkspaceData = JSON.parse(JSON.stringify(initialWorkspaceData));

// Track connected users with socketId -> userId mapping
const connectedUsers = new Map<string, string>();

// Track user data with userId -> user object mapping for persistence
const userRegistry = new Map<string, User>();

// Maintain a name -> userId mapping to handle reconnections
const nameToUserId = new Map<string, string>();

// Socket.io event handlers
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send current workspace data to the newly connected user
  socket.emit("workspace:update", workspaceData);

  // User joins the workspace
  socket.on("user:join", (userData: UserJoinData) => {
    let userId: string;
    
    // Check if this user is reconnecting (by name) or has provided a userId
    if (userData.userId && userRegistry.has(userData.userId)) {
      // User is reconnecting with a known userId
      userId = userData.userId;
    } else if (nameToUserId.has(userData.name)) {
      // User is reconnecting by name
      userId = nameToUserId.get(userData.name)!;
    } else {
      // This is a new user, generate a stable userId
      userId = `user-${uuidv4()}`;
      nameToUserId.set(userData.name, userId);
    }
    
    // Register the socket with this userId
    connectedUsers.set(socket.id, userId);
    
    // Update or create the user in our registry
    const user: User = {
      id: userId,
      name: userData.name,
      avatar: userData.avatar,
      status: "active",
      lastActive: new Date().toISOString()
    };
    userRegistry.set(userId, user);
    
    // Update the user in the workspace data if they exist, otherwise add them
    const existingUserIndex = workspaceData.users.findIndex(u => u.id === userId);
    if (existingUserIndex !== -1) {
      workspaceData.users[existingUserIndex] = user;
    } else {
      workspaceData.users.push(user);
    }
    
    // Send back the persistent userId to the client for storage
    socket.emit("user:id", userId);
    
    // Broadcast updated workspace data to all clients
    io.emit("workspace:update", workspaceData);
    console.log(`User joined: ${user.name} (${userId})`);
  });

  // User changes status
  socket.on("user:status", (status: string) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      user.status = status;
      user.lastActive = new Date().toISOString();
      
      // Update the user in the workspace data
      const userIndex = workspaceData.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        workspaceData.users[userIndex] = user;
      }
      
      // Broadcast updated workspace data to all clients
      io.emit("workspace:update", workspaceData);
      console.log(`User ${user.name} changed status to ${status}`);
    }
  });

  // User creates a task
  socket.on("task:create", (taskData: TaskCreateData) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || "todo",
        createdBy: userId,
        assigneeId: taskData.assigneeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      workspaceData.tasks.push(newTask);
      
      // Broadcast updated workspace data to all clients
      io.emit("workspace:update", workspaceData);
      console.log(`Task created: ${newTask.title} by ${user.name}`);
    }
  });

  // User updates a task
  socket.on("task:update", (taskData: TaskUpdateData) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskData.id);
      if (taskIndex !== -1) {
        workspaceData.tasks[taskIndex] = {
          ...workspaceData.tasks[taskIndex],
          ...taskData,
          updatedAt: new Date().toISOString()
        };
        
        // Broadcast updated workspace data to all clients
        io.emit("workspace:update", workspaceData);
        console.log(`Task updated: ${taskData.id} by ${user.name}`);
      }
    }
  });

  // User moves a task
  socket.on("task:move", (taskData: TaskMoveData) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskData.taskId);
      if (taskIndex !== -1) {
        workspaceData.tasks[taskIndex].status = taskData.newStatus;
        workspaceData.tasks[taskIndex].updatedAt = new Date().toISOString();
        
        // Broadcast updated workspace data to all clients
        io.emit("workspace:update", workspaceData);
        console.log(`Task moved: ${taskData.taskId} to ${taskData.newStatus} by ${user.name}`);
      }
    }
  });

  // User sends a message
  socket.on("message:send", (messageData: MessageSendData) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: messageData.text,
        userId: userId,
        createdAt: new Date().toISOString()
      };
      workspaceData.messages.push(newMessage);
      
      // Broadcast updated workspace data to all clients
      io.emit("workspace:update", workspaceData);
      console.log(`Message sent by ${user.name}: ${messageData.text.substring(0, 20)}...`);
    }
  });

  // User typing indicator
  socket.on("user:typing", (isTyping: boolean) => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      // Broadcast typing status to all clients except sender
      socket.broadcast.emit("user:typing", {
        userId: userId,
        isTyping
      });
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    const userId = connectedUsers.get(socket.id);
    if (userId && userRegistry.has(userId)) {
      const user = userRegistry.get(userId)!;
      
      // Remove socket ID from connected users
      connectedUsers.delete(socket.id);
      
      // Mark user as away but don't remove them
      const userIndex = workspaceData.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        workspaceData.users[userIndex].status = "away";
        workspaceData.users[userIndex].lastActive = new Date().toISOString();
      }
      
      // Broadcast updated workspace data to all clients
      io.emit("workspace:update", workspaceData);
      console.log(`User disconnected: ${user.name}`);
    } else {
      console.log(`Unknown user disconnected: ${socket.id}`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
