import { useState, useCallback } from 'react';
import apiService from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    pagination: undefined,
  });

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data || response,
        loading: false,
        error: null,
        pagination: response.pagination,
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        pagination: undefined,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      pagination: undefined,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for common operations
export function useUsers() {
  const { data, loading, error, pagination, execute } = useApi<{ users: any[] }>();
  
  const fetchUsers = useCallback((params?: { role?: string; search?: string; per_page?: number; page?: number }) => {
    return execute(() => apiService.getUsers(params));
  }, [execute]);

  const fetchManagers = useCallback(() => {
    return execute(() => apiService.getManagers());
  }, [execute]);

  return {
    users: data?.users || [],
    loading,
    error,
    pagination,
    fetchUsers,
    fetchManagers,
  };
}

export function useProjects() {
  const { data, loading, error, pagination, execute } = useApi<{ projects: any[] }>();
  
  const fetchProjects = useCallback((params?: { status?: string; per_page?: number; page?: number }) => {
    return execute(() => apiService.getProjects(params));
  }, [execute]);

  const createProject = useCallback((projectData: any) => {
    return execute(() => apiService.createProject(projectData));
  }, [execute]);

  return {
    projects: data?.projects || [],
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
  };
}
// Health check hook for Laravel 12
export function useHealth() {
  const { data, loading, error, execute } = useApi<{ status: string; timestamp: string; laravel_version: string }>();
  
  const checkHealth = useCallback(() => {
    return execute(() => apiService.checkHealth());
  }, [execute]);

  return {
    health: data,
    loading,
    error,
    checkHealth,
  };
}