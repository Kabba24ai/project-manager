
import React, { useState } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle, AlertTriangle, Users, Calendar, ArrowLeft, X, MoreVertical, Edit, Trash2, Paperclip, MessageSquare, Settings } from 'lucide-react';
import { ViewType } from '../types';
import { useProjects } from '../hooks/useApi';

interface DashboardProps {
  onViewChange: (view: ViewType, data?: any) => void;
  authContext?: {
    user: any;
    isAuthenticated: boolean;
    logout: () => void;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, authContext }) => {
  // API hooks
  const { projects: apiProjects, loading: projectsLoading, fetchProjects } = useProjects();

  const [allTasks, setAllTasks] = useState([
    {
      id: 1,
      title: 'Create wireframes for homepage',
      description: 'Design wireframes for the new homepage layout including hero section, navigation, and footer',
      priority: 'high',
      status: 'pending_review',
      assigned_to: 'John Doe',
      due_date: '2024-06-30',
      project_id: 1
    },
    {
      id: 2,
      title: 'Update user authentication system',
      description: 'Implement new OAuth flow and update security protocols',
      priority: 'medium',
      status: 'pending_review',
      assigned_to: 'Jane Smith',
      due_date: '2024-07-05',
      project_id: 1
    },
    {
      id: 3,
      title: 'Database optimization review',
      description: 'Review and optimize database queries for better performance',
      priority: 'urgent',
      status: 'needs_work',
      assigned_to: 'Mike Johnson',
      due_date: '2024-06-28',
      project_id: 2,
      feedback: 'Please add more detailed performance metrics and benchmark results.'
    },
    {
      id: 4,
      title: 'Mobile UI component library',
      description: 'Create reusable UI components for mobile app',
      priority: 'high',
      status: 'pending_review',
      assigned_to: 'Sarah Wilson',
      due_date: '2024-07-01',
      project_id: 2
    },
    {
      id: 5,
      title: 'API documentation update',
      description: 'Update API documentation with new endpoints',
      priority: 'medium',
      status: 'needs_work',
      assigned_to: 'Tom Brown',
      due_date: '2024-06-29',
      project_id: 1,
      feedback: 'Missing examples for the new authentication endpoints. Please add code samples.'
    },
    {
      id: 6,
      title: 'Campaign analytics setup',
      description: 'Set up tracking and analytics for marketing campaigns',
      priority: 'high',
      status: 'pending_review',
      assigned_to: 'Lisa Chen',
      due_date: '2024-07-03',
      project_id: 4
    },
    {
      id: 7,
      title: 'Dashboard performance issues',
      description: 'Investigate and fix slow loading times on analytics dashboard',
      priority: 'urgent',
      status: 'needs_work',
      assigned_to: 'David Kim',
      due_date: '2024-06-27',
      project_id: 4,
      feedback: 'Need more specific performance metrics and proposed solutions.'
    }
  ]);

  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [showProjectTasks, setShowProjectTasks] = useState(null); // { projectId, status }

  // Load projects on component mount
  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Use API projects or fallback to empty array
  const projects = apiProjects.length > 0 ? apiProjects : [];

  const [activeTab, setActiveTab] = useState('active');
  
  const filteredProjects = projects.filter(project =>
  activeTab === 'active' 
    ? ['active', 'planning'].includes(project.status) 
    : project.status === 'completed'
);

  // Get task counts by project and status
  const getTaskCounts = (projectId, status) => {
    return allTasks.filter(task => task.project_id === projectId && task.status === status).length;
  };

  // Get tasks for a specific project and status
  const getProjectTasks = (projectId, status) => {
    return allTasks.filter(task => task.project_id === projectId && task.status === status);
  };

  const handleApproveTask = (taskId) => {
    setAllTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'approved' }
        : task
    ));
  };

  const handleNeedsWorkTask = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForDetail(task);
      setShowTaskDetailModal(true);
    }
  };

  const handleTaskDetails = (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForDetail(task);
      setShowTaskDetailModal(true);
    }
  };

  const handleShowProjectTasks = (projectId, status) => {
    if (showProjectTasks?.projectId === projectId && showProjectTasks?.status === status) {
      setShowProjectTasks(null); // Close if clicking the same button
    } else {
      setShowProjectTasks({ projectId, status });
    }
  };

  const TaskCard = ({ task, section }) => (
    <div className="bg-white rounded-lg border border-yellow-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 text-xs mb-3">{task.description}</p>

      {section === 'needs_work' && task.feedback && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <strong className="text-red-800">Feedback:</strong>
          <p className="text-red-700 mt-1">{task.feedback}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{task.assigned_to}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          {section === 'pending_review' && (
            <>
              <button
                onClick={() => handleApproveTask(task.id)}
                className="bg-green-600 text-white text-xs py-1 px-3 rounded hover:bg-green-700 flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleNeedsWorkTask(task.id)}
                className="bg-red-600 text-white text-xs py-1 px-3 rounded hover:bg-red-700 flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Needs Work</span>
              </button>
            </>
          )}
          {section === 'needs_work' && (
            <button
              onClick={() => handleNeedsWorkTask(task.id)}
              className="bg-orange-600 text-white text-xs py-1 px-3 rounded hover:bg-orange-700 flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Update</span>
            </button>
          )}
          <button
            onClick={() => handleTaskDetails(task.id)}
            className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700 flex items-center space-x-1"
          >
            <Users className="w-3 h-3" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );

  const TaskDetailModal = ({ task, onClose, onSave }) => {
    const [comment, setComment] = useState('');
    const [feedback, setFeedback] = useState(task?.feedback || '');

    if (!task) return null;

    const handleSaveWithFeedback = () => {
      if (feedback.trim()) {
        onSave(task.id, feedback);
      } else {
        alert('Please add feedback before saving.');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Task Description</h3>
              <p className="text-gray-600 mb-4">{task.description}</p>
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                <span>Assigned to: {task.assigned_to}</span>
                <span>•</span>
                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                <span>•</span>
                <span>Priority: {task.priority}</span>
              </div>
            </div>

            {task.feedback && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2">Current Feedback</h3>
                <p className="text-red-700 text-sm">{task.feedback}</p>
              </div>
            )}

            {task.status === 'pending_review' && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Add Feedback (Needs Work)</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain what needs to be changed or improved..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Add Comment</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {task.status === 'pending_review' && feedback.trim() && (
                <button 
                  onClick={handleSaveWithFeedback}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Save as Needs Work
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Task Master K</h1>
            <div className="flex items-center space-x-2">
              {authContext?.user && (
                <>
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{authContext.user.name}</span>
                  <span className="text-xs text-gray-500">({authContext.user.role})</span>
                  <button
                    onClick={authContext.logout}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {!authContext?.user && (
                <>
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">Admin User</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button 
              onClick={() => onViewChange('add-project')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active ({projects.filter(p => p.status === 'active').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed ({projects.filter(p => p.status === 'completed').length})
                </button>
              </div>
            </div>

            {projectsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading projects...</p>
                <p className="text-xs text-gray-400 mt-2">If this takes too long, make sure Laravel backend is running</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProjects.map(project => {
                  const pendingReviewCount = getTaskCounts(project.id, 'pending_review');
                  const needsWorkCount = getTaskCounts(project.id, 'needs_work');
                  
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="cursor-pointer"
                        onClick={() => onViewChange('project-detail', project)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{project.completed_tasks || 0}/{project.tasks_count || 0}</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress_percentage || 0}%` }}
                            />
                          </div>
                          
                          <div className="text-right text-xs text-gray-500">
                            {project.progress_percentage || 0}% complete
                          </div>
                        </div>
                      </div>

                      {/* Task Action Buttons */}
                      <div className="flex space-x-2 pt-3 border-t border-gray-100">
                        {pendingReviewCount > 0 && (
                          <button
                            onClick={() => handleShowProjectTasks(project.id, 'pending_review')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              showProjectTasks?.projectId === project.id && showProjectTasks?.status === 'pending_review'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Review ({pendingReviewCount})</span>
                            </div>
                          </button>
                        )}
                        
                        {needsWorkCount > 0 && (
                          <button
                            onClick={() => handleShowProjectTasks(project.id, 'needs_work')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              showProjectTasks?.projectId === project.id && showProjectTasks?.status === 'needs_work'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Needs Work ({needsWorkCount})</span>
                            </div>
                          </button>
                        )}
                        
                        {pendingReviewCount === 0 && needsWorkCount === 0 && (
                          <div className="flex-1 px-3 py-2 text-center text-sm text-gray-500 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-green-700">All Clear</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first project</p>
                <button 
                  onClick={() => onViewChange('add-project')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>

          {/* Task Details Section - Only show when a project's tasks are selected */}
          {showProjectTasks && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showProjectTasks.status === 'pending_review' ? 'Pending Review' : 'Needs Work'} - {' '}
                    {projects.find(p => p.id === showProjectTasks.projectId)?.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    showProjectTasks.status === 'pending_review' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getProjectTasks(showProjectTasks.projectId, showProjectTasks.status).length} tasks
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewChange('project-detail', projects.find(p => p.id === showProjectTasks.projectId))}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Project →
                  </button>
                  <button
                    onClick={() => setShowProjectTasks(null)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {getProjectTasks(showProjectTasks.projectId, showProjectTasks.status).map(task => (
                  <TaskCard key={task.id} task={task} section={showProjectTasks.status} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State - Only show when no tasks are being displayed */}
          {!showProjectTasks && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Overview</h3>
              <p className="text-gray-500">Click on the task buttons above to view pending reviews or tasks that need work for each project.</p>
            </div>
          )}
        </div>
      </main>

      {showTaskDetailModal && selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          onClose={() => {
            setShowTaskDetailModal(false);
            setSelectedTaskForDetail(null);
          }}
          onSave={(taskId, feedback) => {
            setAllTasks(prev => prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'needs_work', feedback: feedback }
                : task
            ));
            setShowTaskDetailModal(false);
            setSelectedTaskForDetail(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;