// API service for Laravel backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://projectmanager.kabba.ai/api';
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

  private getMockProjectDetail(id: number) {
    return {
      data: {
        project: {
          id: id,
          name: "E-commerce Platform Redesign",
          description: "Complete overhaul of the existing e-commerce platform with modern UI/UX principles and improved performance",
          status: "active",
          priority: "high",
          start_date: "2024-01-15",
          due_date: "2024-04-30",
          budget: "75000.00",
          client: "TechCorp Solutions",
          progress_percentage: 65,
          tasks_count: 12,
          completed_tasks: 8,
          created_at: "2024-01-15T10:30:00.000000Z",
          updated_at: "2024-01-20T14:45:00.000000Z",
          objectives: [
            "Improve user experience and conversion rates by 25%",
            "Implement modern responsive design for all devices",
            "Optimize performance and reduce loading times by 40%"
          ],
          deliverables: [
            "New responsive website design and implementation",
            "Mobile-optimized user interface with PWA features",
            "Performance optimization report and implementation"
          ],
          tags: ["web", "ecommerce", "redesign", "ui/ux", "performance"],
          settings: {
            taskTypes: {
              general: true,
              equipmentId: false,
              customerName: true
            },
            allowFileUploads: true,
            requireApproval: true,
            enableTimeTracking: true,
            publicProject: false
          },
          team: [
            { id: 1, name: "Sarah Johnson", email: "sarah.johnson@taskmaster.com", role: "manager", avatar: "SJ" },
            { id: 2, name: "Mike Chen", email: "mike.chen@taskmaster.com", role: "developer", avatar: "MC" },
            { id: 3, name: "Emily Rodriguez", email: "emily.rodriguez@taskmaster.com", role: "designer", avatar: "ER" },
            { id: 4, name: "David Kim", email: "david.kim@taskmaster.com", role: "developer", avatar: "DK" }
          ],
          project_manager: {
            id: 1,
            name: "Sarah Johnson",
            email: "sarah.johnson@taskmaster.com",
            role: "manager",
            avatar: "SJ"
          },
          task_lists: [
            {
              id: 1,
              name: "To Do",
              description: "Tasks that are planned but not yet started",
              color: "bg-gray-100",
              order: 1,
              tasks_count: 3,
              created_at: "2024-01-15T10:30:00.000000Z",
              updated_at: "2024-01-15T10:30:00.000000Z",
              tasks: [
                {
                  id: 1,
                  title: "Setup project structure",
                  description: "Initialize the project with proper folder structure and dependencies",
                  priority: "high",
                  task_type: "general",
                  start_date: "2024-02-01",
                  due_date: "2024-02-15",
                  estimated_hours: 16,
                  actual_hours: null,
                  tags: ["setup", "structure", "dependencies"],
                  feedback: null,
                  attachments_count: 0,
                  comments_count: 1,
                  created_at: "2024-01-15T10:30:00.000000Z",
                  updated_at: "2024-01-15T10:30:00.000000Z",
                  assigned_to: {
                    id: 2,
                    name: "Mike Chen",
                    email: "mike.chen@taskmaster.com",
                    role: "developer",
                    avatar: "MC"
                  }
                },
                {
                  id: 2,
                  title: "Design system documentation",
                  description: "Create comprehensive design system documentation for the project",
                  priority: "medium",
                  task_type: "design",
                  start_date: "2024-02-05",
                  due_date: "2024-02-20",
                  estimated_hours: 24,
                  actual_hours: null,
                  tags: ["design", "documentation", "system"],
                  feedback: null,
                  attachments_count: 2,
                  comments_count: 0,
                  created_at: "2024-01-16T09:15:00.000000Z",
                  updated_at: "2024-01-16T09:15:00.000000Z",
                  assigned_to: {
                    id: 3,
                    name: "Emily Rodriguez",
                    email: "emily.rodriguez@taskmaster.com",
                    role: "designer",
                    avatar: "ER"
                  }
                }
              ]
            },
            {
              id: 2,
              name: "In Progress",
              description: "Tasks currently being worked on",
              color: "bg-blue-100",
              order: 2,
              tasks_count: 2,
              created_at: "2024-01-15T10:30:00.000000Z",
              updated_at: "2024-01-15T10:30:00.000000Z",
              tasks: [
                {
                  id: 3,
                  title: "Implement user authentication",
                  description: "Add login and registration functionality with OAuth integration",
                  priority: "urgent",
                  task_type: "feature",
                  start_date: "2024-01-20",
                  due_date: "2024-02-10",
                  estimated_hours: 32,
                  actual_hours: 18,
                  tags: ["authentication", "security", "oauth"],
                  feedback: null,
                  attachments_count: 1,
                  comments_count: 4,
                  created_at: "2024-01-17T11:20:00.000000Z",
                  updated_at: "2024-01-20T16:30:00.000000Z",
                  assigned_to: {
                    id: 2,
                    name: "Mike Chen",
                    email: "mike.chen@taskmaster.com",
                    role: "developer",
                    avatar: "MC"
                  }
                }
              ]
            },
            {
              id: 3,
              name: "Review",
              description: "Tasks completed and awaiting review",
              color: "bg-yellow-100",
              order: 3,
              tasks_count: 1,
              created_at: "2024-01-15T10:30:00.000000Z",
              updated_at: "2024-01-15T10:30:00.000000Z",
              tasks: [
                {
                  id: 4,
                  title: "Homepage wireframes",
                  description: "Create wireframes for the new homepage layout",
                  priority: "high",
                  task_type: "design",
                  start_date: "2024-01-18",
                  due_date: "2024-01-30",
                  estimated_hours: 16,
                  actual_hours: 14,
                  tags: ["wireframes", "homepage", "design"],
                  feedback: "Great progress! Please add mobile breakpoint wireframes.",
                  attachments_count: 3,
                  comments_count: 2,
                  created_at: "2024-01-18T14:10:00.000000Z",
                  updated_at: "2024-01-25T10:45:00.000000Z",
                  assigned_to: {
                    id: 3,
                    name: "Emily Rodriguez",
                    email: "emily.rodriguez@taskmaster.com",
                    role: "designer",
                    avatar: "ER"
                  }
                }
              ]
            },
            {
              id: 4,
              name: "Done",
              description: "Completed and approved tasks",
              color: "bg-green-100",
              order: 4,
              tasks_count: 2,
              created_at: "2024-01-15T10:30:00.000000Z",
              updated_at: "2024-01-15T10:30:00.000000Z",
              tasks: [
                {
                  id: 5,
                  title: "Database schema design",
                  description: "Design and implement the database schema for the project",
                  priority: "high",
                  task_type: "general",
                  start_date: "2024-01-15",
                  due_date: "2024-01-25",
                  estimated_hours: 20,
                  actual_hours: 18,
                  tags: ["database", "schema", "design"],
                  feedback: null,
                  attachments_count: 1,
                  comments_count: 3,
                  created_at: "2024-01-15T10:30:00.000000Z",
                  updated_at: "2024-01-25T15:20:00.000000Z",
                  assigned_to: {
                    id: 4,
                    name: "David Kim",
                    email: "david.kim@taskmaster.com",
                    role: "developer",
                    avatar: "DK"
                  }
                }
              ]
            }
          ],
          is_overdue: false,
          days_until_due: 65,
          can_user_edit: true
        }
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
          this.useMockData = true;
          throw new Error('Backend unavailable - using mock data');
        }
        if (response.status === 404) {
          throw new Error('Resource not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
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
      this.useMockData = false;
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
      this.useMockData = true;
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
      this.useMockData = true;
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
      this.useMockData = true;
      return this.getMockProjects();
    }
  }

  async getProject(id: number) {
    if (this.useMockData) {
      console.log('Using mock data for project details');
      return this.getMockProjectDetail(id);
    }
    
    try {
      return this.request<{ project: any }>(`/projects/${id}`);
    } catch (error) {
      console.log('Falling back to mock data for project details');
      this.useMockData = true;
      return this.getMockProjectDetail(id);
    }
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
      this.useMockData = true;
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
    if (this.useMockData) {
      console.log('Using mock data for project update');
      return {
        data: {
          project: { id, ...projectData, updated_at: new Date().toISOString() },
          message: 'Project updated successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ project: any }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.log('Falling back to mock data for project update');
      this.useMockData = true;
      return {
        data: {
          project: { id, ...projectData, updated_at: new Date().toISOString() },
          message: 'Project updated successfully (mock data)'
        }
      };
    }
  }

  async deleteProject(id: number) {
    if (this.useMockData) {
      console.log('Using mock data for project deletion');
      return {
        data: { message: 'Project deleted successfully (mock data)' }
      };
    }
    
    try {
      return this.request(`/projects/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Falling back to mock data for project deletion');
      this.useMockData = true;
      return {
        data: { message: 'Project deleted successfully (mock data)' }
      };
    }
  }

  // Task Lists
  async getTaskLists(projectId: number) {
    if (this.useMockData) {
      console.log('Using mock data for task lists');
      return {
        data: {
          task_lists: [
            { id: 1, name: 'To Do', color: 'bg-gray-100', order: 1, tasks: [] },
            { id: 2, name: 'In Progress', color: 'bg-blue-100', order: 2, tasks: [] },
            { id: 3, name: 'Review', color: 'bg-yellow-100', order: 3, tasks: [] },
            { id: 4, name: 'Done', color: 'bg-green-100', order: 4, tasks: [] }
          ]
        }
      };
    }
    
    try {
      console.log('🔄 API: Fetching task lists for project:', projectId);
      return this.request<{ task_lists: any[] }>(`/projects/${projectId}/task-lists`);
    } catch (error) {
      console.error('❌ API: Failed to fetch task lists:', error);
      console.log('🔄 API: Falling back to mock data for task lists');
      this.useMockData = true;
      return {
        data: {
          task_lists: [
            { id: 1, name: 'To Do', color: 'bg-gray-100', order: 1, tasks: [] },
            { id: 2, name: 'In Progress', color: 'bg-blue-100', order: 2, tasks: [] },
            { id: 3, name: 'Review', color: 'bg-yellow-100', order: 3, tasks: [] },
            { id: 4, name: 'Done', color: 'bg-green-100', order: 4, tasks: [] }
          ]
        }
      };
    }
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
      this.useMockData = true;
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
    if (this.useMockData) {
      console.log('Using mock data for task list update');
      return {
        data: {
          task_list: { id: taskListId, ...taskListData, updated_at: new Date().toISOString() },
          message: 'Task list updated successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ task_list: any }>(`/task-lists/${taskListId}`, {
        method: 'PUT',
        body: JSON.stringify(taskListData),
      });
    } catch (error) {
      console.log('Falling back to mock data for task list update');
      this.useMockData = true;
      return {
        data: {
          task_list: { id: taskListId, ...taskListData, updated_at: new Date().toISOString() },
          message: 'Task list updated successfully (mock data)'
        }
      };
    }
  }

  async deleteTaskList(taskListId: number) {
    if (this.useMockData) {
      console.log('Using mock data for task list deletion');
      return {
        data: { message: 'Task list deleted successfully (mock data)' }
      };
    }
    
    try {
      return this.request(`/task-lists/${taskListId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Falling back to mock data for task list deletion');
      this.useMockData = true;
      return {
        data: { message: 'Task list deleted successfully (mock data)' }
      };
    }
  }

  async reorderTaskLists(projectId: number, taskLists: any[]) {
    if (this.useMockData) {
      console.log('Using mock data for task list reordering');
      return {
        data: {
          task_lists: taskLists,
          message: 'Task lists reordered successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ task_lists: any[] }>(`/projects/${projectId}/task-lists/reorder`, {
        method: 'POST',
        body: JSON.stringify({ task_lists: taskLists }),
      });
    } catch (error) {
      console.log('Falling back to mock data for task list reordering');
      this.useMockData = true;
      return {
        data: {
          task_lists: taskLists,
          message: 'Task lists reordered successfully (mock data)'
        }
      };
    }
  }

  async getEquipment(params?: { search?: string; status?: string; type?: string }) {
    if (this.useMockData) {
      console.log('Using mock data for equipment');
      return {
        data: {
          equipment: [
            { id: 1, name: 'MacBook Pro 16"', code: 'MBP-001', type: 'computer', status: 'active' },
            { id: 2, name: 'Dell OptiPlex 7090', code: 'PC-002', type: 'computer', status: 'active' },
            { id: 3, name: 'Canon EOS R5', code: 'CAM-001', type: 'tool', status: 'active' }
          ]
        }
      };
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.type) searchParams.append('type', params.type);
      
      const query = searchParams.toString();
      return this.request<{ equipment: any[] }>(`/equipment${query ? `?${query}` : ''}`);
    } catch (error) {
      console.log('Falling back to mock data for equipment');
      this.useMockData = true;
      return {
        data: {
          equipment: [
            { id: 1, name: 'MacBook Pro 16"', code: 'MBP-001', type: 'computer', status: 'active' },
            { id: 2, name: 'Dell OptiPlex 7090', code: 'PC-002', type: 'computer', status: 'active' },
            { id: 3, name: 'Canon EOS R5', code: 'CAM-001', type: 'tool', status: 'active' }
          ]
        }
      };
    }
  }

  // Customers
  async getCustomers(params?: { search?: string; status?: string }) {
    if (this.useMockData) {
      console.log('Using mock data for customers');
      return {
        data: {
          customers: [
            { id: 1, name: 'John Smith', company: 'TechCorp Solutions', email: 'john.smith@techcorp.com', status: 'active' },
            { id: 2, name: 'Sarah Johnson', company: 'InnovateTech Inc', email: 'sarah@innovatetech.com', status: 'active' },
            { id: 3, name: 'Michael Chen', company: 'Digital Future LLC', email: 'mchen@digitalfuture.com', status: 'active' }
          ]
        }
      };
    }
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);
      
      const query = searchParams.toString();
      return this.request<{ customers: any[] }>(`/customers${query ? `?${query}` : ''}`);
    } catch (error) {
      console.log('Falling back to mock data for customers');
      this.useMockData = true;
      return {
        data: {
          customers: [
            { id: 1, name: 'John Smith', company: 'TechCorp Solutions', email: 'john.smith@techcorp.com', status: 'active' },
            { id: 2, name: 'Sarah Johnson', company: 'InnovateTech Inc', email: 'sarah@innovatetech.com', status: 'active' },
            { id: 3, name: 'Michael Chen', company: 'Digital Future LLC', email: 'mchen@digitalfuture.com', status: 'active' }
          ]
        }
      };
    }
  }

  // Tasks
  async getTasks(taskListId: number) {
    if (this.useMockData) {
      console.log('Using mock data for tasks');
      return {
        data: { tasks: [] }
      };
    }
    
    try {
      return this.request<{ tasks: any[] }>(`/task-lists/${taskListId}/tasks`);
    } catch (error) {
      console.log('Falling back to mock data for tasks');
      this.useMockData = true;
      return {
        data: { tasks: [] }
      };
    }
  }

  async createTask(taskListId: number, taskData: any) {
    if (this.useMockData) {
      console.log('Using mock data for task creation');
      const mockTask = {
        id: Date.now(),
        ...taskData,
        task_list_id: taskListId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments_count: 0,
        comments_count: 0
      };
      return {
        data: {
          task: mockTask,
          message: 'Task created successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ task: any }>(`/task-lists/${taskListId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    } catch (error) {
      console.log('Falling back to mock data for task creation');
      this.useMockData = true;
      const mockTask = {
        id: Date.now(),
        ...taskData,
        task_list_id: taskListId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments_count: 0,
        comments_count: 0
      };
      return {
        data: {
          task: mockTask,
          message: 'Task created successfully (mock data)'
        }
      };
    }
  }

  async createTaskWithAttachments(taskListId: number, formData: FormData) {
    if (this.useMockData) {
      console.log('Using mock data for task creation with attachments');
      return {
        data: {
          task: {
            id: Date.now(),
            task_list_id: taskListId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attachments_count: 1,
            comments_count: 0
          },
          message: 'Task with attachments created successfully (mock data)'
        }
      };
    }
    
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
          this.useMockData = true;
          throw new Error('Backend unavailable - using mock data');
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (!error.message?.includes('Authentication')) {
        console.warn('API connection failed:', error.message);
      }
      this.useMockData = true;
      throw error;
    }
  }

  async createTask(taskListId: number, taskData: any) {
    console.log('🔄 API: Creating task in task list:', taskListId);
    console.log('📝 API: Task data:', taskData);
    console.log('🔗 API: Request URL:', `${API_BASE_URL}/task-lists/${taskListId}/tasks`);
    console.log('🔑 API: Auth token present:', !!this.token);
    
    if (this.useMockData) {
      console.log('Using mock data for task creation');
      const mockTask = {
        id: Date.now(),
        ...taskData,
        task_list_id: taskListId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments_count: 0,
        comments_count: 0,
        assigned_to: {
          id: taskData.assigned_to,
          name: 'Mock User',
          email: 'mock@example.com',
          role: 'developer',
          avatar: 'MU'
        }
      };
      return {
        data: {
          task: mockTask,
          message: 'Task created successfully (mock data)'
        }
      };
    }
    
    try {
      const response = await this.request<{ task: any }>(`/task-lists/${taskListId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      
      console.log('✅ API: Task creation successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API: Task creation failed:', error);
      console.error('❌ API: Error details:', {
        message: error.message,
        taskListId,
        taskData,
        apiUrl: `${API_BASE_URL}/task-lists/${taskListId}/tasks`
      });
      
      console.log('Falling back to mock data for task creation');
      this.useMockData = true;
      const mockTask = {
        id: Date.now(),
        ...taskData,
        task_list_id: taskListId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments_count: 0,
        comments_count: 0,
        assigned_to: {
          id: taskData.assigned_to,
          name: 'Mock User',
          email: 'mock@example.com',
          role: 'developer',
          avatar: 'MU'
        }
      };
      return {
        data: {
          task: mockTask,
          message: 'Task created successfully (mock data)'
        }
      };
    }
  }

  async updateTask(taskId: number, taskData: any) {
    console.log('🔄 API: Creating task with attachments in task list:', taskListId);
    
    if (this.useMockData) {
      console.log('Using mock data for task update');
      return {
        data: {
          task: { id: taskId, ...taskData, updated_at: new Date().toISOString() },
          message: 'Task updated successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ task: any }>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    } catch (error) {
      console.log('Falling back to mock data for task update');
      this.useMockData = true;
      return {
        data: {
          task: { id: taskId, ...taskData, updated_at: new Date().toISOString() },
          message: 'Task updated successfully (mock data)'
        }
      };
    }
  }
  async moveTask(taskId: number, taskListId: number) {
    if (this.useMockData) {
      console.log('Using mock data for task move');
      return {
        data: {
          task: { id: taskId, task_list_id: taskListId, updated_at: new Date().toISOString() },
          message: 'Task moved successfully (mock data)'
        }
      };
    }
    
    try {
    return this.request<{ task: any }>(`/tasks/${taskId}/move`, {
      method: 'POST',
      body: JSON.stringify({ task_list_id: taskListId }),
    });
    } catch (error) {
      console.log('Falling back to mock data for task move');
      this.useMockData = true;
      return {
        data: {
          task: { id: taskId, task_list_id: taskListId, updated_at: new Date().toISOString() },
          message: 'Task moved successfully (mock data)'
        }
      };
    }
  }

  // Comments
  async getComments(taskId: number) {
    if (this.useMockData) {
      console.log('Using mock data for comments');
      return {
        data: { comments: [] }
      };
    }
    
    try {
      return this.request<{ comments: any[] }>(`/tasks/${taskId}/comments`);
    } catch (error) {
      console.log('Falling back to mock data for comments');
      this.useMockData = true;
      return {
        data: { comments: [] }
      };
    }
  }

  async createComment(taskId: number, commentData: any) {
    if (this.useMockData) {
      console.log('Using mock data for comment creation');
      return {
        data: {
          comment: {
            id: Date.now(),
            task_id: taskId,
            ...commentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          message: 'Comment created successfully (mock data)'
        }
      };
    }
    
    try {
      return this.request<{ comment: any }>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
    } catch (error) {
      console.log('Falling back to mock data for comment creation');
      this.useMockData = true;
      return {
        data: {
          comment: {
            id: Date.now(),
            task_id: taskId,
            ...commentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          message: 'Comment created successfully (mock data)'
        }
      };
    }
  }

  // Attachments
  async uploadAttachment(formData: FormData) {
    if (this.useMockData) {
      console.log('Using mock data for attachment upload');
      return {
        data: {
          attachments: [{
            id: Date.now(),
            filename: 'mock-file.jpg',
            original_filename: 'mock-file.jpg',
            size: 1024,
            created_at: new Date().toISOString()
          }],
          message: 'File uploaded successfully (mock data)'
        }
      };
    }
    
    try {
    console.log('🌐 API: Making file upload request to:', url);
      const url = `${API_BASE_URL}/attachments`;
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

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
        console.error('❌ API: File upload failed with status:', response.status);
        console.error('❌ API: Error response:', data);
        if (response.status === 401) {
          this.useMockData = true;
          throw new Error('Backend unavailable - using mock data');
        }
        throw new Error(data.message || 'Upload failed');
      }

      console.log('✅ API: Task with attachments created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API: Task with attachments creation failed:', error);
      console.log('Falling back to mock data for attachment upload');
      this.useMockData = true;
      return {
        data: {
          attachments: [{
            id: Date.now(),
            filename: 'mock-file.jpg',
            original_filename: 'mock-file.jpg',
            size: 1024,
            created_at: new Date().toISOString()
          }],
          message: 'File uploaded successfully (mock data)'
        }
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;