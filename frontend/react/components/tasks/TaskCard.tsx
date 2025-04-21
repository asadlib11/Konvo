import React from "react";
import { Task, User } from "../../context/WorkspaceContext";
import UserAvatar from "../shared/UserAvatar";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onEdit: () => void;
  createdBy?: User;
  users: User[];
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onEdit,
  createdBy,
  users,
}) => {
  const assignee = task.assigneeId
    ? users.find((user) => user.id === task.assigneeId)
    : undefined;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <button className="edit-button" onClick={onEdit} title="Edit task">
          ✏️
        </button>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <div className="task-users">
          {assignee && (
            <div
              className="assigned-user"
              title={`Assigned to: ${assignee.name}`}
            >
              <span className="assigned-label">Assigned:</span>
              <UserAvatar
                name={assignee.name}
                avatar={assignee.avatar}
                status={assignee.status}
                size="small"
                showStatus={false}
                className="task-avatar"
              />
            </div>
          )}
          {createdBy && createdBy.id !== (assignee?.id || "") && (
            <div
              className="task-creator"
              title={`Created by: ${createdBy.name}`}
            >
              <span className="creator-label">Created by:</span>
              <UserAvatar
                name={createdBy.name}
                avatar={createdBy.avatar}
                status={createdBy.status}
                size="small"
                showStatus={false}
                className="task-avatar"
              />
            </div>
          )}
        </div>
        <div
          className="task-date"
          title={`Updated: ${formatDate(task.updatedAt)}`}
        >
          {formatDate(task.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
