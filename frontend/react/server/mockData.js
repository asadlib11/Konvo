// Initial mock data for the workspace
export const initialWorkspaceData = {
    // Connected users (will be populated as users join)
    users: [],
    
    // Task data with default tasks
    tasks: [
      {
        id: 'task-1',
        title: 'Implement user authentication',
        description: 'Add login and registration functionality to the app',
        status: 'todo',
        createdBy: 'system',
        createdAt: '2023-01-01T09:00:00.000Z',
        updatedAt: '2023-01-01T09:00:00.000Z'
      },
      {
        id: 'task-2',
        title: 'Design dashboard layout',
        description: 'Create wireframes for the main dashboard',
        status: 'in-progress',
        createdBy: 'system',
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T14:30:00.000Z'
      },
      {
        id: 'task-3',
        title: 'Fix responsive layout bugs',
        description: 'Address issues with mobile view',
        status: 'in-progress',
        createdBy: 'system',
        createdAt: '2023-01-01T11:00:00.000Z',
        updatedAt: '2023-01-01T16:45:00.000Z'
      },
      {
        id: 'task-4',
        title: 'Update documentation',
        description: 'Add new API endpoints to the docs',
        status: 'done',
        createdBy: 'system',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-02T10:15:00.000Z'
      }
    ],
    
    // Chat messages
    messages: [
      {
        id: 'msg-1',
        text: 'Welcome to the collaborative workspace!',
        userId: 'system',
        createdAt: '2023-01-01T08:00:00.000Z'
      }
    ]
  };