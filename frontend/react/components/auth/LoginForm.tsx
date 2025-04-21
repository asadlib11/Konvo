import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import "./LoginForm.css";

const AVATARS = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

const LoginForm: React.FC = () => {
  const { handleLogin } = useWorkspace();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("1");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    handleLogin({ 
      name: name.trim(), 
      avatar: selectedAvatar 
    });
    
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Join Workspace</h2>
        <p>Enter your name and choose an avatar to get started</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Select Avatar</label>
            <div className="avatar-selection">
              {AVATARS.map((avatar) => (
                <div 
                  key={avatar}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img 
                    src={`/assets/avatars/${avatar}.png`} 
                    alt={`Avatar ${avatar}`} 
                    width="24" 
                    height="24"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" className="login-button">
            Join Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
