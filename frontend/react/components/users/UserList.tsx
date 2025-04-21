import React from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import UserAvatar from "../shared/UserAvatar";
import "./UserList.css";

const UserList: React.FC = () => {
  const { state } = useWorkspace();
  const { users, currentUser } = state;

  return (
    <div className="user-list">
      <h3>Team Members</h3>
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="user-item" title={user.name}>
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              status={user.status}
              size="medium"
              showStatus={true}
            />
            <div className="user-info">
              <div className="user-name">
                {user.name} {user.id === currentUser?.id && "(You)"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
