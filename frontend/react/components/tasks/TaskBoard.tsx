import React, { useState } from "react";
import { useWorkspace, Task } from "../../context/WorkspaceContext";
import { TaskStatus, taskStatusLabels } from "../../types";
import TaskColumn from "./TaskColumn";
import TaskForm from "./TaskForm";
import "./TaskBoard.css";

const TaskBoard: React.FC = () => {
  const { state, moveTask } = useWorkspace();
  const { tasks, users } = state;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Group tasks by status with proper typing
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    "todo": tasks.filter(task => task.status === "todo"),
    "in-progress": tasks.filter(task => task.status === "in-progress"),
    "done": tasks.filter(task => task.status === "done")
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    moveTask(taskId, status);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="task-board">
      <div className="task-board-header">
        <h2>Task Board</h2>
        <button 
          className="add-task-button"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
        >
          + Add Task
        </button>
      </div>

      <div className="columns-container">
        {Object.keys(tasksByStatus).map(status => (
          <TaskColumn
            key={status}
            title={taskStatusLabels[status as TaskStatus]}
            tasks={tasksByStatus[status as TaskStatus]}
            status={status as TaskStatus}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEditTask={handleEditTask}
            users={users}
          />
        ))}
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <TaskForm
            task={editingTask}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
