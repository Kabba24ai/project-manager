import { useState, useCallback } from 'react';
import apiService from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState({
        data: response.data || response,
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
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
  const { data, loading, error, execute } = useApi<{ users: any[] }>();
  
  const fetchUsers = useCallback((params?: { role?: string; search?: string }) => {
    return execute(() => apiService.getUsers(params));
  }, [execute]);

  const fetchManagers = useCallback(() => {
    return execute(() => apiService.getManagers());
  }, [execute]);

  return {
    users: data?.users || [],
    loading,
    error,
    fetchUsers,
    fetchManagers,
  };
}

export function useProjects() {
  const { data, loading, error, execute } = useApi<{ projects: any[] }>();
  
  const fetchProjects = useCallback((status?: string) => {
    return execute(() => apiService.getProjects(status));
  }, [execute]);

  const createProject = useCallback((projectData: any) => {
    return execute(() => apiService.createProject(projectData));
  }, [execute]);

  return {
    projects: data?.projects || [],
    loading,
    error,
    fetchProjects,
    createProject,
  };
}