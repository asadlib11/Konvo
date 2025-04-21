import React from "react";
import { useWorkspace, User } from "../../context/WorkspaceContext";
import "./UserList.css";

const UserList: React.FC = () => {
  const { state } = useWorkspace();
  const { users, currentUser, typingUsers } = state;

  return (
    <div className="user-list">
      <h3>Team Members</h3>
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="user-item" title={user.name}>
            <div className="user-avatar">
              <img
                src={`/assets/avatars/${user.avatar}.png`}
                alt={`${user.name}'s avatar`}
                width="24"
                height="24"
              />
              <span className={`avatar-status-indicator ${user.status}`}></span>
            </div>
            <div className="user-info">
              <div className="user-name">
                {user.name} {user.id === currentUser?.id && "(You)"}
              </div>
              {typingUsers[user.id] && (
                <div className="typing-indicator">typing...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
