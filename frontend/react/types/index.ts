/**
 * Shared type definitions for the application
 */

// Task status options
export type TaskStatus = "todo" | "in-progress" | "done";

// Status color mapping for UI elements
export const taskStatusColors: Record<TaskStatus, string> = {
  "todo": "#e0e0e0",
  "in-progress": "#b3e0ff",
  "done": "#c8e6c9"
};

// Status display labels
export const taskStatusLabels: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "done": "Done"
};
