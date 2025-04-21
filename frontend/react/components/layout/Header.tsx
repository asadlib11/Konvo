import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import UserAvatar from "../shared/UserAvatar";
import "./Header.css";

const Header: React.FC = () => {
  const { state, updateUserStatus, handleLogout } = useWorkspace();
  const { currentUser } = state;
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (!currentUser) return null;

  const statusOptions = [
    { value: "active", label: "Active", icon: "🟢" },
    { value: "away", label: "Away", icon: "🟠" },
    { value: "do-not-disturb", label: "Do Not Disturb", icon: "🔴" },
  ];

  const currentStatus = statusOptions.find(
    (option) => option.value === currentUser.status
  ) || statusOptions[0];

  return (
    <header className="app-header">
      <div className="header-title">
        <h1>Collaborative Workspace</h1>
      </div>
      <div className="user-controls">
        <div className="current-user">
          <UserAvatar
            name={currentUser.name}
            avatar={currentUser.avatar}
            status={currentUser.status}
            size="medium"
            showStatus={false}
            className="header-avatar"
          />
          <span className="user-name">{currentUser.name}</span>
        </div>

        <div className="status-selector">
          <button
            className="status-button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
          >
            <span className={`status-indicator ${currentUser.status}`} />
            <span className="status-text">{currentStatus.label}</span>
            <span className="status-arrow">▼</span>
          </button>

          {showStatusMenu && (
            <div className="status-dropdown">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`status-option ${option.value === currentUser.status ? "active" : ""}`}
                  onClick={() => {
                    updateUserStatus(option.value as "active" | "away" | "do-not-disturb");
                    setShowStatusMenu(false);
                  }}
                >
                  <span className={`status-indicator ${option.value}`} />
                  <span>{option.label}</span>
                </button>
              ))}
              <div className="dropdown-divider" />
              <button
                className="logout-option"
                onClick={handleLogout}
              >
                <span className="logout-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
