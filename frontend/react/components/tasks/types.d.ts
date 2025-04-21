// Type declarations for task components

declare module '*/TaskColumn' {
  import { FC } from 'react';
  import { Task, User } from '../../context/WorkspaceContext';
  
  type TaskStatus = "todo" | "in-progress" | "done";
  
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
  
  const TaskColumn: FC<TaskColumnProps>;
  export default TaskColumn;
}

declare module '*/TaskForm' {
  import { FC } from 'react';
  import { Task } from '../../context/WorkspaceContext';
  
  interface TaskFormProps {
    task?: Task;
    onClose: () => void;
  }
  
  const TaskForm: FC<TaskFormProps>;
  export default TaskForm;
}
