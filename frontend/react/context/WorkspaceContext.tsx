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
const getPersistedUser = (): User | null => {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing stored user data:", error);
    localStorage.removeItem('currentUser');
    return null;
  }
};

// Initial state
const initialUser = getPersistedUser();
const initialState: WorkspaceState = {
  isConnected: false,
  currentUser: initialUser,
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
      return { ...state, isConnected: action.payload };

    case "SET_CURRENT_USER":
      // Persist or clear user data in localStorage
      if (action.payload) {
        localStorage.setItem('currentUser', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('currentUser');
      }
      return { ...state, currentUser: action.payload };

    case "UPDATE_WORKSPACE":
      return {
        ...state,
        users: action.payload.users,
        tasks: action.payload.tasks,
        messages: action.payload.messages,
        loading: false,
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

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
  createTask: (taskData: { title: string; description: string; status?: string }) => void;
  updateTask: (taskData: { id: string; title?: string; description?: string }) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  sendMessage: (message: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

// Provider component
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  // Effect for setting initial loading state
  useEffect(() => {
    // If there's no persisted user, there's no need to show the loading state
    if (!state.currentUser) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Effect for handling socket connection and events
  useEffect(() => {
    // Connect to the socket server if we have a persisted user
    if (state.currentUser) {
      // Connect to the socket server
      const socket = socketService.connect();
      
      if (socket) {
        // Rejoin the workspace with persisted user data
        socketService.joinWorkspace({
          name: state.currentUser.name,
          avatar: state.currentUser.avatar
        });
      } else {
        // If socket connection fails, clear loading state
        console.error("Failed to connect to socket server");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    // Set up event listeners
    socketService.onConnect(() => {
      console.log("Connected to server");
      dispatch({ type: "SET_CONNECTED", payload: true });
    });

    socketService.onDisconnect(() => {
      console.log("Disconnected from server");
      dispatch({ type: "SET_CONNECTED", payload: false });
      // Also clear loading in case of disconnection
      dispatch({ type: "SET_LOADING", payload: false });
    });

    socketService.onWorkspaceUpdate((data) => {
      console.log("Workspace updated:", data);
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: {
          users: data.users,
          tasks: data.tasks,
          messages: data.messages,
        },
      });
    });

    socketService.onUserTyping((data) => {
      dispatch({
        type: "SET_TYPING",
        payload: {
          userId: data.userId,
          isTyping: data.isTyping,
        },
      });
    });

    // Set a timeout to clear loading state if the connection takes too long
    const loadingTimeout = setTimeout(() => {
      dispatch({ type: "SET_LOADING", payload: false });
    }, 5000);

    // Clean up event listeners on component unmount
    return () => {
      clearTimeout(loadingTimeout);
      socketService.disconnect();
    };
  }, [state.currentUser?.id]); // Re-run effect if user ID changes

  // Action handlers
  const handleLogin = (userData: Omit<User, "id" | "status" | "lastActive">) => {
    // Set loading while connecting
    dispatch({ type: "SET_LOADING", payload: true });
    
    socketService.connect();
    socketService.joinWorkspace(userData);
    
    const currentUser: User = {
      id: socketService.getSocketId() || "unknown",
      name: userData.name,
      avatar: userData.avatar,
      status: "active",
    };
    
    dispatch({ type: "SET_CURRENT_USER", payload: currentUser });
  };

  const handleLogout = () => {
    socketService.disconnect();
    dispatch({ type: "SET_CURRENT_USER", payload: null });
    dispatch({ type: "SET_LOADING", payload: false });
  };

  const updateUserStatus = (status: "active" | "away" | "do-not-disturb") => {
    socketService.updateStatus(status);
    if (state.currentUser) {
      const updatedUser = { ...state.currentUser, status };
      dispatch({ type: "SET_CURRENT_USER", payload: updatedUser });
    }
  };

  const createTask = (taskData: { title: string; description: string; status?: string }) => {
    socketService.createTask(taskData);
  };

  const updateTask = (taskData: { id: string; title?: string; description?: string }) => {
    socketService.updateTask(taskData as any); // Type casting to fix TypeScript error
  };

  const moveTask = (taskId: string, newStatus: string) => {
    socketService.moveTask(taskId, newStatus);
  };

  const sendMessage = (message: string) => {
    socketService.sendMessage(message);
  };

  const setTyping = (isTyping: boolean) => {
    socketService.setTyping(isTyping);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        handleLogin,
        handleLogout,
        updateUserStatus,
        createTask,
        updateTask,
        moveTask,
        sendMessage,
        setTyping,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkspace = (): WorkspaceContextProps => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
