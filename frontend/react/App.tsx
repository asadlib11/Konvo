import React from "react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import LoginForm from "./components/auth/LoginForm";
import Dashboard from "./components/layout/Dashboard";
import "./App.css";

// Main application content
const WorkspaceApp: React.FC = () => {
  const { state } = useWorkspace();
  const { currentUser, loading } = state;

  // Show loading state
  if (loading && !currentUser) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to workspace...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <LoginForm />;
  }

  // Show the main dashboard
  return <Dashboard />;
};

// Root component with context provider
function App(): React.ReactElement {
  return (
    <WorkspaceProvider>
      <WorkspaceApp />
    </WorkspaceProvider>
  );
}

export default App;
