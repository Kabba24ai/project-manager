export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  createdAt: string;
  dueDate: string;
  tasksCount: number;
  completedTasks: number;
  progressPercentage: number;
  team: User[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  taskLists: TaskList[];
}

export interface TaskList {
  id: number;
  name: string;
  description: string;
  color: string;
  order: number;
  projectId: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string; // This will match the TaskList name
  assignedTo: User;
  projectId: number;
  taskListId: number;
  dueDate: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  attachments: number;
  comments: number;
  taskType: 'general' | 'bug' | 'feature' | 'design' | 'equipmentId' | 'customerName';
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  feedback?: string;
}

export type ViewType = 'dashboard' | 'project-detail' | 'add-project' | 'add-task' | 'add-task-list' | 'edit-task' | 'team' | 'settings' | 'manage-task-lists';