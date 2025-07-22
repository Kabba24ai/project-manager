// API service for Laravel backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
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
      'X-Requested-With': 'XMLHttpRequest',
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

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Authentication required - using mock data');
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      // Only log connection errors, not authentication errors
      if (!error.message?.includes('Authentication')) {
        console.warn('API connection failed:', error.message);
        console.warn('Attempting to connect to:', url);
        console.warn('Make sure Laravel backend is running with: php artisan serve');
      }
      
      // Handle authentication errors
      if (error.message?.includes('Unauthenticated') || error.message?.includes('Authentication')) {
        this.useMockData = true;
      }
      
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    try {
      const response = await this.request<{ user: any; token: string; expires_at?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.data?.token) {
        this.token = response.data.token;
        localStorage.setItem('auth_token', this.token);
        if (response.data.expires_at) {
          localStorage.setItem('token_expires_at', response.data.expires_at);
        }
        this.useMockData = false; // Reset mock data flag on successful login
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: { name: string; email: string; password: string; password_confirmation: string; role: string }) {
    try {
      const response = await this.request<{ user: any; token: string; expires_at?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.data?.token) {
        this.token = response.data.token;
        localStorage.setItem('auth_token', this.token);
        if (response.data.expires_at) {
          localStorage.setItem('token_expires_at', response.data.expires_at);
        }
        this.useMockData = false; // Reset mock data flag on successful registration
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local cleanup even if server request fails
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expires_at');
    }
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/user');
  }

  // Health check for Laravel 12
  async checkHealth() {
    try {
      return await this.request<{ status: string; timestamp: string; laravel_version: string }>('/health');
    } catch (error) {
      this.useMockData = true;
      return { data: { status: 'mock', timestamp: new Date().toISOString(), laravel_version: 'mock' } };
    }
  }
  // Users
  async getUsers(params?: { role?: string; search?: string; per_page?: number; page?: number }) {
    if (this.useMockData) {
      console.log('Using mock data for users');
      return this.getMockUsers();
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.append('role', params.role);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
      if (params?.page) searchParams.append('page', params.page.toString());
      
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
  async getProjects(params?: { status?: string; per_page?: number; page?: number }) {
    if (this.useMockData) {
      console.log('Using mock data for projects');
      return this.getMockProjects();
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
      if (params?.page) searchParams.append('page', params.page.toString());
      
      const query = searchParams.toString();
      return this.request<{ projects: any[] }>(`/projects${query ? `?${query}` : ''}`);
    } catch (error) {
      console.log('Falling back to mock data for projects');
      return this.getMockProjects();
    }
  }

  async getProject(id: number) {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    if (this.useMockData) {
      console.log('Using mock data for project creation');
      // Simulate successful project creation
      const mockProject = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        progress_percentage: 0,
        tasks_count: 0,
        completed_tasks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        team: [],
        task_lists: [
          { id: 1, name: 'To Do', color: 'bg-gray-100', tasks: [] },
          { id: 2, name: 'In Progress', color: 'bg-blue-100', tasks: [] },
          { id: 3, name: 'Review', color: 'bg-yellow-100', tasks: [] },
          { id: 4, name: 'Done', color: 'bg-green-100', tasks: [] }
        ]
      };
      
      return {
        data: {
          project: mockProject,
          message: 'Project created successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ project: any }>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.log('Falling back to mock data for project creation');
      // Return mock success response
      const mockProject = {
        id: Date.now(),
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
        progress_percentage: 0,
        tasks_count: 0,
        completed_tasks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        team: [],
        task_lists: []
      };
      
      return {
        data: {
          project: mockProject,
          message: 'Project created successfully (mock data)'
        }
      };
    }
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
    if (this.useMockData) {
      console.log('Using mock data for task list creation');
      // Simulate successful task list creation
      const mockTaskList = {
        id: Date.now(),
        name: taskListData.name,
        description: taskListData.description,
        color: taskListData.color || 'bg-blue-100',
        order: Date.now(),
        project_id: projectId,
        tasks_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks: []
      };
      
      return {
        data: {
          task_list: mockTaskList,
          message: 'Task list created successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ task_list: any }>(`/projects/${projectId}/task-lists`, {
        method: 'POST',
        body: JSON.stringify(taskListData),
      });
    } catch (error) {
      console.log('Falling back to mock data for task list creation');
      // Return mock success response
      const mockTaskList = {
        id: Date.now(),
        name: taskListData.name,
        description: taskListData.description,
        color: taskListData.color || 'bg-blue-100',
        order: Date.now(),
        project_id: projectId,
        tasks_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks: []
      };
      
      return {
        data: {
          task_list: mockTaskList,
          message: 'Task list created successfully (mock data)'
        }
      };
    }
  }

  async updateTaskList(taskListId: number, taskListData: any) {
    return this.request<{ task_list: any }>(`/projects/${projectId}/task-lists`, {
      method: 'POST',
      body: JSON.stringify(taskListData),
    });
  }

  async deleteTaskList(taskListId: number) {
    return this.request(`/task-lists/${taskListId}`, {
      method: 'DELETE',
    });
  }

  async reorderTaskLists(projectId: number, taskLists: any[]) {
    return this.request<{ task_lists: any[] }>(`/projects/${projectId}/task-lists/reorder`, {
      method: 'POST',
      body: JSON.stringify({ task_lists: taskLists }),
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

  async createTaskWithAttachments(taskListId: number, formData: FormData) {
    // For file uploads, we need to use FormData and not set Content-Type header
    const url = `${API_BASE_URL}/task-lists/${taskListId}/tasks/with-attachments`;
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required - using mock data');
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (!error.message?.includes('Authentication')) {
        console.warn('API connection failed:', error.message);
      }
      throw error;
    }
  }

  async updateTask(taskId: number, taskData: any) {
    return this.request<{ task: any }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }
async moveTask(taskId: number, taskListId: number) {
  async moveTask(taskId: number, taskListId: number) {
    return this.request<{ task: any }>(`/tasks/${taskId}/move`, {
      method: 'POST',
      body: JSON.stringify({ task_list_id: taskListId }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;