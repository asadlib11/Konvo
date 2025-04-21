import React from "react";
import { Task, User } from "../../context/WorkspaceContext";
import { TaskStatus } from "../../types";
import TaskCard from "./TaskCard";
import "./TaskColumn.css";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  users: User[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  users,
  onDragStart,
  onDragOver,
  onDrop,
  onEditTask,
}) => {
  return (
    <div
      className="task-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="tasks-container">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onEdit={() => onEditTask(task)}
              createdBy={users.find((user) => user.id === task.createdBy)}
              users={users}
            />
          ))
        ) : (
          <div className="empty-column">
            <p>No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
