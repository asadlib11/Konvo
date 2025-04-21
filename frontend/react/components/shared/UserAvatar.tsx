import React from 'react';
import './UserAvatar.css';

interface UserAvatarProps {
  name: string;
  avatar: string;
  status?: string;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  status,
  size = 'medium',
  showStatus = true,
  className = '',
}) => {
  return (
    <div className={`user-avatar ${size} ${className}`}>
      <img
        src={`/assets/avatars/${avatar}.png`}
        alt={`${name}'s avatar`}
        className="avatar-image"
      />
      {showStatus && status && (
        <span className={`avatar-status-indicator ${status}`}></span>
      )}
    </div>
  );
};

export default UserAvatar;
