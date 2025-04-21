// Define types for the workspace data
interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastActive: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

interface WorkspaceData {
  users: User[];
  tasks: Task[];
  messages: Message[];
}

// Initial mock data for the workspace
export const initialWorkspaceData: WorkspaceData = {
  // Connected users (will be populated as users join)
  users: [],

  // Task data with default tasks
  tasks: [
    {
      id: "task-1",
      title: "Implement user authentication",
      description: "Add login and registration functionality to the app",
      status: "todo",
      createdBy: "system",
      assigneeId: undefined,
      createdAt: "2023-01-01T09:00:00.000Z",
      updatedAt: "2023-01-01T09:00:00.000Z",
    },
    {
      id: "task-2",
      title: "Design dashboard layout",
      description: "Create wireframes for the main dashboard",
      status: "in-progress",
      createdBy: "system",
      assigneeId: undefined,
      createdAt: "2023-01-01T10:00:00.000Z",
      updatedAt: "2023-01-01T14:30:00.000Z",
    },
    {
      id: "task-3",
      title: "Fix responsive layout bugs",
      description: "Address issues with mobile view",
      status: "in-progress",
      createdBy: "system",
      assigneeId: undefined,
      createdAt: "2023-01-01T11:00:00.000Z",
      updatedAt: "2023-01-01T16:45:00.000Z",
    },
    {
      id: "task-4",
      title: "Update documentation",
      description: "Add new API endpoints to the docs",
      status: "done",
      createdBy: "system",
      assigneeId: undefined,
      createdAt: "2023-01-01T12:00:00.000Z",
      updatedAt: "2023-01-02T10:15:00.000Z",
    },
  ],

  // Chat messages
  messages: [
    {
      id: "msg-1",
      text: "Welcome to the collaborative workspace!",
      userId: "system",
      createdAt: "2023-01-01T08:00:00.000Z",
    },
  ],
};
