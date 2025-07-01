import { Project, Task, User, TaskList } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    avatar: 'SJ',
    role: 'manager'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    avatar: 'MC',
    role: 'developer'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    avatar: 'ER',
    role: 'designer'
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@company.com',
    avatar: 'DK',
    role: 'developer'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    email: 'lisa.wang@company.com',
    avatar: 'LW',
    role: 'admin'
  }
];

// NO DEFAULT TASK LISTS - Projects start with empty task lists
export const mockTaskLists: TaskList[] = [];

export const mockTasks: Task[] = [];

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX principles',
    status: 'active',
    createdAt: '2024-01-15',
    dueDate: '2024-04-30',
    tasksCount: 0,
    completedTasks: 0,
    progressPercentage: 0,
    team: [mockUsers[0], mockUsers[1], mockUsers[2]],
    priority: 'high',
    taskLists: []
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Native iOS and Android application for customer engagement',
    status: 'active',
    createdAt: '2024-02-01',
    dueDate: '2024-06-15',
    tasksCount: 0,
    completedTasks: 0,
    progressPercentage: 0,
    team: [mockUsers[1], mockUsers[3], mockUsers[4]],
    priority: 'medium',
    taskLists: []
  },
  {
    id: 3,
    name: 'Digital Marketing Campaign',
    description: 'Q2 digital marketing initiatives and brand awareness campaigns',
    status: 'completed',
    createdAt: '2024-01-01',
    dueDate: '2024-03-31',
    tasksCount: 0,
    completedTasks: 0,
    progressPercentage: 0,
    team: [mockUsers[0], mockUsers[2]],
    priority: 'medium',
    taskLists: []
  },
  {
    id: 4,
    name: 'Data Analytics Dashboard',
    description: 'Internal dashboard for business intelligence and data visualization',
    status: 'on-hold',
    createdAt: '2024-02-15',
    dueDate: '2024-07-30',
    tasksCount: 0,
    completedTasks: 0,
    progressPercentage: 0,
    team: [mockUsers[3], mockUsers[4]],
    priority: 'low',
    taskLists: []
  }
];

export const getTasksByStatus = (status: string): Task[] => {
  return mockTasks.filter(task => task.status === status);
};

export const getTasksByProject = (projectId: number): Task[] => {
  return mockTasks.filter(task => task.projectId === projectId);
};

export const getTaskListsByProject = (projectId: number): TaskList[] => {
  return mockTaskLists.filter(list => list.projectId === projectId);
};

export const getOverdueTasks = (): Task[] => {
  const today = new Date();
  return mockTasks.filter(task => 
    new Date(task.dueDate) < today && task.status !== 'Done'
  );
};