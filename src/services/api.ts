// API service for Laravel backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private token: string | null = null;
  private useMockData: boolean = false;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Mock data fallback
  private getMockProjects() {
    return {
      data: {
        projects: [
          {
            id: 1,
            name: "Website Redesign",
            description: "Complete overhaul of company website with modern design and improved user experience",
            status: "active",
            progress_percentage: 65,
            tasks_count: 12,
            completed_tasks: 8,
            created_at: "2024-01-15",
            updated_at: "2024-01-20"
          },
          {
            id: 2,
            name: "Mobile App Development",
            description: "Native iOS and Android app for customer engagement",
            status: "active",
            progress_percentage: 30,
            tasks_count: 20,
            completed_tasks: 6,
            created_at: "2024-01-10",
            updated_at: "2024-01-18"
          }
        ]
      }
    };
  }

  private getMockUsers() {
    return {
      data: {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com", role: "manager" },
          { id: 2, name: "Jane Smith", email: "jane@example.com", role: "developer" },
          { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "designer" }
        ]
      }
    };
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
      console.error('Attempting to connect to:', url);
      console.error('Make sure Laravel backend is running with: php artisan serve');
      
      // Set flag to use mock data for subsequent requests
      this.useMockData = true;
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
    if (this.useMockData) {
      console.log('Using mock data for users');
      return this.getMockUsers();
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.append('role', params.role);
      if (params?.search) searchParams.append('search', params.search);
      
      const query = searchParams.toString();
      return this.request<{ users: any[] }>(`/users${query ? `?${query}` : ''}`);
    } catch (error) {
      console.log('Falling back to mock data for users');
      return this.getMockUsers();
    }
  }

  async getManagers() {
    if (this.useMockData) {
      console.log('Using mock data for managers');
      const mockUsers = this.getMockUsers();
      return {
        data: {
          managers: mockUsers.data.users.filter(user => user.role === 'manager')
        }
      };
    }
    
    try {
      return this.request<{ managers: any[] }>('/users/managers');
    } catch (error) {
      console.log('Falling back to mock data for managers');
      const mockUsers = this.getMockUsers();
      return {
        data: {
          managers: mockUsers.data.users.filter(user => user.role === 'manager')
        }
      };
    }
  }

  // Projects
  async getProjects(status?: string) {
    if (this.useMockData) {
      console.log('Using mock data for projects');
      return this.getMockProjects();
    }
    
    try {
      const query = status ? `?status=${status}` : '';
      return this.request<{ projects: any[] }>(`/projects${query}`);
    } catch (error) {
      console.log('Falling back to mock data for projects');
      return this.getMockProjects();
    }
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