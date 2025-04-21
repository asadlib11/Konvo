import React from "react";
import { Task, User } from "../../context/WorkspaceContext";
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
              <div className="avatar-container">
                <img
                  src={`/assets/avatars/${assignee.avatar}.png`}
                  alt={`${assignee.name}'s avatar`}
                  width="24"
                  height="24"
                />
              </div>
            </div>
          )}
          {createdBy && createdBy.id !== (assignee?.id || "") && (
            <div
              className="task-creator"
              title={`Created by: ${createdBy.name}`}
            >
              <span className="creator-label">Created by:</span>
              <div className="avatar-container">
                <img
                  src={`/assets/avatars/${createdBy.avatar}.png`}
                  alt={`${createdBy.name}'s avatar`}
                  width="24"
                  height="24"
                />
              </div>
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
