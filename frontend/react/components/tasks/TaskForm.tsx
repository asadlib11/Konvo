import React, { useState, useEffect } from "react";
import { useWorkspace, Task } from "../../context/WorkspaceContext";
import "./TaskForm.css";

interface TaskFormProps {
  task: Task | null;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { createTask, updateTask } = useWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("todo");
  const [error, setError] = useState("");

  // If editing an existing task, populate the form
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (task) {
      // Update existing task
      updateTask({
        id: task.id,
        title: title.trim(),
        description: description.trim(),
      });
    } else {
      // Create new task
      createTask({
        title: title.trim(),
        description: description.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <div className="task-form-container">
      <div className="task-form">
        <div className="form-header">
          <h3>{task ? "Edit Task" : "Create Task"}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={4}
            />
          </div>

          {!task && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
