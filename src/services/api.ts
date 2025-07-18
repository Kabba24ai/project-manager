// API service for Laravel backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser() {
    return this.request<any>('/auth/user');
  }

  // Users
  async getUsers(params?: { role?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return this.request<{ users: any[] }>(`/users${query ? `?${query}` : ''}`);
  }

  async getManagers() {
    return this.request<{ managers: any[] }>('/users/managers');
  }

  // Projects
  async getProjects(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ projects: any[] }>(`/projects${query}`);
  }

  async getProject(id: number) {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.request<{ project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: number, projectData: any) {
    return this.request<{ project: any }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: number) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Task Lists
  async getTaskLists(projectId: number) {
    return this.request<{ task_lists: any[] }>(`/projects/${projectId}/task-lists`);
  }

  async createTaskList(projectId: number, taskListData: any) {
    return this.request<{ task_list: any }>(`/projects/${projectId}/task-lists`, {
      method: 'POST',
      body: JSON.stringify(taskListData),
    });
  }

  // Tasks
  async getTasks(taskListId: number) {
    return this.request<{ tasks: any[] }>(`/task-lists/${taskListId}/tasks`);
  }

  async createTask(taskListId: number, taskData: any) {
    return this.request<{ task: any }>(`/task-lists/${taskListId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: number, taskData: any) {
    return this.request<{ task: any }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async moveTask(taskId: number, taskListId: number) {
    return this.request<{ task: any }>(`/tasks/${taskId}/move`, {
      method: 'POST',
      body: JSON.stringify({ task_list_id: taskListId }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;