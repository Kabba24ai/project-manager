import React, { useState } from 'react';
import AuthWrapper from './components/AuthWrapper';
import { ViewType, Project, Task, TaskList } from './types';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import AddTaskForm from './components/AddTaskForm';
import AddProjectForm from './components/AddProjectForm';
import AddTaskListForm from './components/AddTaskListForm';

interface AppProps {
  authContext?: {
    user: any;
    isAuthenticated: boolean;
    logout: () => void;
  };
}

const AppContent: React.FC<AppProps> = ({ authContext }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Global state for task lists - this would normally be in a state management system
  const [globalTaskLists, setGlobalTaskLists] = useState<TaskList[]>([]);

  const handleViewChange = (view: ViewType, data?: any) => {
    setCurrentView(view);
    
    if (view === 'project-detail' && data) {
      // Update the project with current task lists
      const updatedProject = {
        ...data,
        taskLists: globalTaskLists.filter(list => list.projectId === data.id)
      };
      setSelectedProject(updatedProject);
    } else if (view === 'edit-task' && data) {
      setSelectedTask(data);
    } else if (view === 'dashboard') {
      setSelectedProject(null);
      setSelectedTask(null);
    }
  };

  const handleTaskListCreated = (newTaskList: TaskList) => {
    setGlobalTaskLists(prev => [...prev, newTaskList]);
  };

  const handleTaskCreated = (newTask: Task) => {
    setGlobalTaskLists(prev => prev.map(list => 
      list.id === newTask.taskListId 
        ? { ...list, tasks: [...list.tasks, newTask] }
        : list
    ));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} authContext={authContext} />;
      
      case 'project-detail':
        return selectedProject ? (
          <ProjectDetail 
            project={{
              ...selectedProject,
              taskLists: globalTaskLists.filter(list => list.projectId === selectedProject.id)
            }} 
            onViewChange={handleViewChange}
            onTaskListUpdate={setGlobalTaskLists}
            authContext={authContext}
          />
        ) : (
          <Dashboard onViewChange={handleViewChange} authContext={authContext} />
        );
      
      case 'add-project':
        return <AddProjectForm onViewChange={handleViewChange} />;
      
      case 'add-task':
        return (
          <AddTaskForm 
            onViewChange={handleViewChange} 
            selectedProject={{
              ...selectedProject,
              taskLists: globalTaskLists.filter(list => list.projectId === selectedProject?.id)
            }}
            onTaskCreated={handleTaskCreated}
            authContext={authContext}
          />
        );
      
      case 'add-task-list':
        return (
          <AddTaskListForm 
            onViewChange={handleViewChange} 
            selectedProject={selectedProject}
            onTaskListCreated={handleTaskListCreated}
          />
        );
      
      case 'edit-task':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleViewChange(selectedProject ? 'project-detail' : 'dashboard')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h2>
                <p className="text-gray-600 mb-2">Task: {selectedTask?.title}</p>
                <p className="text-gray-500 mb-6">Task editing form will be implemented here.</p>
                <button
                  onClick={() => handleViewChange(selectedProject ? 'project-detail' : 'dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );

      case 'manage-task-lists':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleViewChange('project-detail', selectedProject)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>←</span>
                    <span>Back to Project</span>
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Task Lists</h1>
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task List Management</h2>
                <p className="text-gray-600 mb-6">Manage task lists for this project. You can add, edit, reorder, and delete task lists.</p>
                <button
                  onClick={() => handleViewChange('project-detail', selectedProject)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Project
                </button>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Management</h2>
              <p className="text-gray-600 mb-6">Team management interface will be implemented here.</p>
              <button
                onClick={() => handleViewChange('dashboard')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600 mb-6">Application settings will be implemented here.</p>
              <div className="space-y-4">
                <button
                  onClick={() => handleViewChange('dashboard')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
                {authContext?.user && (
                  <button
                    onClick={authContext.logout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="App" data-user={authContext?.user?.name}>
      {renderCurrentView()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
};

export default App;