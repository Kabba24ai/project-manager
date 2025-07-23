import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Settings, MoreVertical, Calendar, Clock, Target } from 'lucide-react';
import { ViewType, Project, TaskList } from '../types';
import apiService from '../services/api';

interface ProjectDetailProps {
  project: Project | null;
  onViewChange: (view: ViewType, data?: any) => void;
  onTaskListUpdate: (taskLists: TaskList[]) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project: initialProject, 
  onViewChange, 
  onTaskListUpdate 
}) => {
  const [project, setProject] = useState<Project | null>(initialProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load project details from backend
  useEffect(() => {
    const loadProjectDetails = async () => {
      if (!initialProject?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getProject(initialProject.id);
        
        if (response.data?.project) {
          // Transform backend response to frontend format
          const backendProject = response.data.project;
          
          const transformedProject: Project = {
            id: backendProject.id,
            name: backendProject.name,
            description: backendProject.description,
            status: backendProject.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
            createdAt: backendProject.created_at,
            dueDate: backendProject.due_date,
            tasksCount: backendProject.tasks_count || 0,
            completedTasks: backendProject.completed_tasks || 0,
            progressPercentage: backendProject.progress_percentage || 0,
            team: backendProject.team || [],
            priority: backendProject.priority as 'low' | 'medium' | 'high' | 'urgent',
            taskLists: (backendProject.task_lists || []).map((list: any) => ({
              id: list.id,
              name: list.name,
              description: list.description || '',
              color: list.color || 'bg-gray-100',
              order: list.order || 0,
              projectId: backendProject.id,
              tasks: list.tasks || [],
              createdAt: list.created_at,
              updatedAt: list.updated_at
            }))
          };
          
          setProject(transformedProject);
          
          // Update parent component with task lists
          onTaskListUpdate(transformedProject.taskLists);
        }
      } catch (error) {
        console.error('Failed to load project details:', error);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [initialProject?.id, onTaskListUpdate]);

  const handleRetry = () => {
    if (initialProject?.id) {
      const loadProjectDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await apiService.getProject(initialProject.id);
          if (response.data?.project) {
            const backendProject = response.data.project;
            
            const transformedProject: Project = {
              id: backendProject.id,
              name: backendProject.name,
              description: backendProject.description,
              status: backendProject.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
              createdAt: backendProject.created_at,
              dueDate: backendProject.due_date,
              tasksCount: backendProject.tasks_count || 0,
              completedTasks: backendProject.completed_tasks || 0,
              progressPercentage: backendProject.progress_percentage || 0,
              team: backendProject.team || [],
              priority: backendProject.priority as 'low' | 'medium' | 'high' | 'urgent',
              taskLists: (backendProject.task_lists || []).map((list: any) => ({
                id: list.id,
                name: list.name,
                description: list.description || '',
                color: list.color || 'bg-gray-100',
                order: list.order || 0,
                projectId: backendProject.id,
                tasks: list.tasks || [],
                createdAt: list.created_at,
                updatedAt: list.updated_at
              }))
            };
            
            setProject(transformedProject);
            onTaskListUpdate(transformedProject.taskLists);
          }
        } catch (error) {
          console.error('Failed to load project details:', error);
          setError('Failed to load project details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      loadProjectDetails();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Project</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => onViewChange('dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No project data available</p>
          <button
            onClick={() => onViewChange('dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onViewChange('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Projects</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 text-sm">{project.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              
              <button
                onClick={() => onViewChange('add-task-list', project)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add List</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => onViewChange('add-task', project)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-semibold text-gray-900">{project.progressPercentage}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="font-semibold text-gray-900">{project.completedTasks}/{project.tasksCount}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Team</p>
                <p className="font-semibold text-gray-900">{project.team.length} members</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Lists */}
        {project.taskLists && project.taskLists.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {project.taskLists.map((taskList) => (
              <div key={taskList.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className={`px-4 py-3 ${taskList.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{taskList.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 truncate">{taskList.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 whitespace-nowrap">
                        {taskList.tasks.length} tasks
                      </span>
                      <button
                        onClick={handleAddTask}
                        className="flex items-center space-x-1 px-2 py-1 bg-white text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors border border-gray-200 whitespace-nowrap"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 min-h-[300px]">
                  {taskList.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {taskList.tasks.map((task) => (
                        <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between">
                              {task.assignedTo && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                      {task.assignedTo.avatar}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
                                </div>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">No tasks in {taskList.name}</h4>
                      <button
                        onClick={handleAddTask}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        Add a task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <List className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Task Lists Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Get started by creating task lists to organize your project. You can create lists like "To Do", "In Progress", "Review", and "Done".
            </p>
            <button
              onClick={handleAddTaskList}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Task List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;