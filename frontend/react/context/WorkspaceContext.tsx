import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { socketService } from "../services/socketService";

// Define the types for our workspace state
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "active" | "away" | "do-not-disturb";
  lastActive?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  createdBy: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface WorkspaceState {
  isConnected: boolean;
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  messages: Message[];
  loading: boolean;
  typingUsers: Record<string, boolean>;
}

// Define action types
type ActionType =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | { type: "UPDATE_WORKSPACE"; payload: { users: User[]; tasks: Task[]; messages: Message[] } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TYPING"; payload: { userId: string; isTyping: boolean } };

// Get persisted user from localStorage if available
const getPersistedUser = (): { user: User | null; userId: string | null } => {
  try {
    const userData = localStorage.getItem('currentUser');
    const userId = localStorage.getItem('userId');
    return { 
      user: userData ? JSON.parse(userData) : null,
      userId
    };
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    return { user: null, userId: null };
  }
};

// Initial state
const initialState: WorkspaceState = {
  isConnected: false,
  currentUser: getPersistedUser().user,
  users: [],
  tasks: [],
  messages: [],
  loading: true,
  typingUsers: {},
};

// Reducer function
const workspaceReducer = (state: WorkspaceState, action: ActionType): WorkspaceState => {
  switch (action.type) {
    case "SET_CONNECTED":
      return {
        ...state,
        isConnected: action.payload,
      };
    case "SET_CURRENT_USER":
      return {
        ...state,
        currentUser: action.payload,
      };
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        users: action.payload.users,
        tasks: action.payload.tasks,
        messages: action.payload.messages,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_TYPING":
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.userId]: action.payload.isTyping,
        },
      };
    default:
      return state;
  }
};

// Create the context
interface WorkspaceContextProps {
  state: WorkspaceState;
  handleLogin: (userData: Omit<User, "id" | "status" | "lastActive">) => void;
  handleLogout: () => void;
  updateUserStatus: (status: "active" | "away" | "do-not-disturb") => void;
  createTask: (taskData: { title: string; description: string; status?: string; assigneeId?: string }) => void;
  updateTask: (taskData: { id: string; title?: string; description?: string; assigneeId?: string }) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  sendMessage: (message: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

// Provider component
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Connect to socket server
  useEffect(() => {
    socketService.init();

    socketService.onConnect(() => {
      dispatch({ type: "SET_CONNECTED", payload: true });
      console.log("Connected to socket server");

      // If user was previously logged in, auto-reconnect
      const { user, userId } = getPersistedUser();
      if (user && userId) {
        // Send the userId along with login to maintain session
        socketService.joinWorkspace({ 
          name: user.name, 
          avatar: user.avatar,
          userId: userId || undefined // Convert null to undefined if needed
        });
      }
    });

    socketService.onDisconnect(() => {
      dispatch({ type: "SET_CONNECTED", payload: false });
      console.log("Disconnected from socket server");
    });

    socketService.onWorkspaceUpdate((data) => {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: data,
      });
      
      // Try to identify current user after workspace update
      const { userId } = getPersistedUser();
      if (userId) {
        // Find our user in the updated data
        const currentUser = data.users.find((user: User) => user.id === userId);
        if (currentUser) {
          dispatch({ type: "SET_CURRENT_USER", payload: currentUser });
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    });

    socketService.onTyping(({ userId, isTyping }) => {
      dispatch({
        type: "SET_TYPING",
        payload: { userId, isTyping },
      });
    });
    
    // Listen for user ID assignments
    socketService.onUserId((userId) => {
      console.log("Received user ID from server:", userId);
      // Save the user ID in localStorage
      localStorage.setItem('userId', userId);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Update currentUser when users change
  useEffect(() => {
    if (state.currentUser && state.users.length > 0) {
      const updatedCurrentUser = state.users.find(
        (user) => user.name === state.currentUser?.name
      );
      if (updatedCurrentUser) {
        dispatch({ type: "SET_CURRENT_USER", payload: updatedCurrentUser });
        // Keep persistent record of the user
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
      }
    }
  }, [state.users, state.currentUser]);

  // Handle user login
  const handleLogin = (userData: Omit<User, "id" | "status" | "lastActive">) => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    // Get persisted userId if available
    const { userId } = getPersistedUser();
    
    // Join the workspace with userId if we have one
    socketService.joinWorkspace({ 
      ...userData,
      userId: userId || undefined // Convert null to undefined if needed
    });
  };

  // Handle user logout
  const handleLogout = () => {
    socketService.disconnect();
    
    // Clear user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    
    dispatch({ type: "SET_CURRENT_USER", payload: null });
    window.location.reload(); // Force reload to clean up
  };

  // Update user status
  const updateUserStatus = (status: "active" | "away" | "do-not-disturb") => {
    socketService.updateStatus(status);
  };

  // Create a new task
  const createTask = (taskData: { title: string; description: string; status?: string; assigneeId?: string }) => {
    socketService.createTask(taskData);
  };

  // Update an existing task
  const updateTask = (taskData: { id: string; title?: string; description?: string; assigneeId?: string }) => {
    socketService.updateTask(taskData);
  };

  // Move a task to a different status
  const moveTask = (taskId: string, newStatus: string) => {
    socketService.moveTask(taskId, newStatus);
  };

  // Send a chat message
  const sendMessage = (message: string) => {
    socketService.sendMessage(message);
  };

  // Update typing status
  const setTyping = (isTyping: boolean) => {
    socketService.setTyping(isTyping);
  };

  const value = {
    state,
    handleLogin,
    handleLogout,
    updateUserStatus,
    createTask,
    updateTask,
    moveTask,
    sendMessage,
    setTyping,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

// Custom hook to use the context
export const useWorkspace = (): WorkspaceContextProps => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
