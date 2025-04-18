# Collaborative Workspace Dashboard - Senior Frontend Engineer Takehome

This repository contains the starter code for a collaborative workspace dashboard application. Your task is to build a real-time frontend application that allows team members to manage tasks, share updates, and communicate in a shared digital environment.

## Overview

The application should include:

1. **User Presence System**
   - Login with name and avatar selection
   - Display of active team members
   - Status indicators (active, away, do not disturb)

2. **Task Board**
   - Kanban-style board with at least 3 columns (To Do, In Progress, Done)
   - Create, edit, and move tasks between columns
   - Real-time updates when other users modify tasks

3. **Team Chat (BONUS)**
   - Simple chat interface for team communication
   - Message display with user avatars and timestamps
   - Typing indicators

## Technical Requirements

- Build the frontend using **either React or Vue** (starter code for both is provided)
- Implement a clean state management approach 
  - React: Context API, Redux, or similar
  - Vue: Composition API with provide/inject, Pinia, Vuex, or similar
- Create modular, reusable components with clear separation of concerns
- Utilize the provided Socket.io implementation for real-time features

## Getting Started

1. Clone this repository
2. Choose your preferred framework:
   - For React: Use the code in the `/react` directory
   - For Vue: Use the code in the `/vue` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the mock server:
   ```
   npm run server
   ```
5. In another terminal, start the frontend development server:
   ```
   npm run dev
   ```
6. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Project Structure

The repository includes:

- A mock Socket.io server (/server)
- Basic frontend scaffolding for both React and Vue
- Empty directories for you to implement your component structure

## Available Socket Events

The mock server implements these events:

- **user:join** - Send when a user joins with their name and avatar
- **user:status** - Send when a user changes their status
- **task:create** - Send when a user creates a new task
- **task:update** - Send when a user updates a task
- **task:move** - Send when a user moves a task between columns
- **message:send** - Send when a user sends a chat message
- **user:typing** - Send when a user starts/stops typing
- **workspace:update** - Received with the current workspace state after any change

## Socket Event Reference

The mock server handles all socket interactions, so you only need to implement the client-side events:

```javascript
// Connect to the server
socketService.connect();

// Join the workspace (after login)
socketService.joinWorkspace({ name: 'User Name', avatar: '1' });

// Change user status
socketService.updateStatus('away'); // 'active', 'away', or 'do-not-disturb'

// Create a new task
socketService.createTask({
  title: 'Task Title',
  description: 'Task Description',
  status: 'todo' // 'todo', 'in-progress', or 'done'
});

// Update an existing task
socketService.updateTask({
  id: 'task-1',
  title: 'Updated Title',
  description: 'Updated Description'
});

// Move a task to a different status
socketService.moveTask('task-1', 'in-progress');

// Send a chat message
socketService.sendMessage('Hello team!');

// Send typing indicator
socketService.setTyping(true); // or false when stopped typing
```

## Evaluation Criteria

Your submission will be evaluated based on:

- **Component Architecture**: How well-structured and maintainable is your component hierarchy?
- **State Management**: How effectively do you manage and propagate state throughout the application?
- **Real-time Implementation**: How well does your application handle real-time updates and events?
- **Code Quality**: Is your code clean, well-documented, and following best practices?
- **Feature Completeness**: Did you implement all the required features within the time constraints?

## Submission

1. Create a GitHub repository with your solution
2. Include setup instructions and notes on your implementation decisions
3. Email the repository link to the provided contact email

## Time Expectation

This project should take approximately 2-3 hours to complete. Focus on code quality and component structure rather than visual polish.

## FAQ

**Q: Do I need to implement user authentication?**  
A: No, a simple name input is sufficient.

**Q: Should I create a database?**  
A: No, the mock server maintains state in memory during the session.

**Q: How polished should the UI be?**  
A: Focus on structure and functionality rather than visual polish. A clean, usable interface is sufficient.

**Q: Can I use additional libraries?**  
A: Yes, but be prepared to justify your choices in the follow-up discussion.

Good luck! We're excited to see your approach to this challenge.
