import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initialWorkspaceData } from './mockData.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Clone the initial data to avoid modifying the original
let workspaceData = JSON.parse(JSON.stringify(initialWorkspaceData));

// Track connected users
const connectedUsers = new Map();

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send current workspace data to the newly connected user
  socket.emit('workspace:update', workspaceData);
  
  // User joins the workspace
  socket.on('user:join', (userData) => {
    const user = {
      id: socket.id,
      name: userData.name,
      avatar: userData.avatar,
      status: 'active',
      lastActive: new Date().toISOString()
    };
    
    connectedUsers.set(socket.id, user);
    workspaceData.users.push(user);
    
    // Broadcast updated workspace data to all clients
    io.emit('workspace:update', workspaceData);
    console.log(`User joined: ${user.name}`);
  });
  
  // User changes status
  socket.on('user:status', (status) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.status = status;
      user.lastActive = new Date().toISOString();
      
      // Update the user in the workspace data
      const userIndex = workspaceData.users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        workspaceData.users[userIndex] = user;
      }
      
      // Broadcast updated workspace data to all clients
      io.emit('workspace:update', workspaceData);
      console.log(`User ${user.name} changed status to ${status}`);
    }
  });
  
  // User creates a task
  socket.on('task:create', (taskData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      workspaceData.tasks.push(newTask);
      
      // Broadcast updated workspace data to all clients
      io.emit('workspace:update', workspaceData);
      console.log(`Task created: ${newTask.title} by ${user.name}`);
    }
  });
  
  // User updates a task
  socket.on('task:update', (taskData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskData.id);
      if (taskIndex !== -1) {
        workspaceData.tasks[taskIndex] = {
          ...workspaceData.tasks[taskIndex],
          ...taskData,
          updatedAt: new Date().toISOString()
        };
        
        // Broadcast updated workspace data to all clients
        io.emit('workspace:update', workspaceData);
        console.log(`Task updated: ${taskData.id} by ${user.name}`);
      }
    }
  });
  
  // User moves a task
  socket.on('task:move', ({ taskId, newStatus }) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const taskIndex = workspaceData.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        workspaceData.tasks[taskIndex].status = newStatus;
        workspaceData.tasks[taskIndex].updatedAt = new Date().toISOString();
        
        // Broadcast updated workspace data to all clients
        io.emit('workspace:update', workspaceData);
        console.log(`Task moved: ${taskId} to ${newStatus} by ${user.name}`);
      }
    }
  });
  
  // User sends a message
  socket.on('message:send', (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        text: messageData.text,
        userId: socket.id,
        createdAt: new Date().toISOString()
      };
      
      workspaceData.messages.push(newMessage);
      
      // Broadcast updated workspace data to all clients
      io.emit('workspace:update', workspaceData);
      console.log(`Message sent by ${user.name}: ${messageData.text.substring(0, 20)}...`);
    }
  });
  
  // User typing indicator
  socket.on('user:typing', (isTyping) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Broadcast typing status to all clients except sender
      socket.broadcast.emit('user:typing', {
        userId: socket.id,
        isTyping
      });
    }
  });
  
  // User disconnects
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Remove user from connected users and workspace data
      connectedUsers.delete(socket.id);
      workspaceData.users = workspaceData.users.filter(u => u.id !== socket.id);
      
      // Broadcast updated workspace data to all clients
      io.emit('workspace:update', workspaceData);
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