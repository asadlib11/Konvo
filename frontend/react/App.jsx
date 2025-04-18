import React from 'react';
import { useState, useEffect } from 'react';
import { socketService } from './services/socketService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Connect to the socket server
    socketService.connect();

    // Set up event listeners
    socketService.onConnect(() => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socketService.onDisconnect(() => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketService.onWorkspaceUpdate((data) => {
      console.log('Workspace updated:', data);
      setWorkspace(data);
    });

    // Clean up event listeners on component unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Handle user login
  const handleLogin = (userData) => {
    socketService.joinWorkspace(userData);
    setCurrentUser({
      id: socketService.getSocketId(),
      ...userData
    });
  };

  // For now, just render some basic UI to show connection status
  // You will replace this with your component structure
  return (
    <div className="app">
      <header>
        <h1>Collaborative Workspace</h1>
        <div className="connection-status">
          {isConnected ? (
            <span className="status connected" />
          ) : (
            <span className="status disconnected" />
          )}
        </div>
      </header>

      <main>
        {!currentUser ? (
          <div className="login-container">
            <h2>Join Workspace</h2>
            <p>Enter your name and choose an avatar to get started</p>
            
            {/* TODO: Implement login form */}
            <button onClick={() => handleLogin({ name: 'Test User', avatar: '1' })}>
              Join as Test User
            </button>
          </div>
        ) : (
          <div className="workspace-container">
            {workspace ? (
              <div>
                <p>Welcome, {currentUser.name}!</p>
                <p>There are {workspace.users.length} users online.</p>
                <p>Tasks: {workspace.tasks.length}</p>
                <p>Messages: {workspace.messages.length}</p>
                
                {/* TODO: Implement workspace components */}
              </div>
            ) : (
              <p>Loading workspace data...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
