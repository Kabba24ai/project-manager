import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Settings, Calendar, X, MoreVertical, Edit, Trash2, Paperclip, MessageSquare, Clock, Upload, Send, Eye, ChevronDown, List, Image, Video, FileText } from 'lucide-react';
import { Project, Task, TaskList, ViewType } from '../types';
import { formatDate, calculateProgress } from '../utils/helpers';

interface ProjectDetailProps {
  project: Project;
  onViewChange: (view: ViewType, data?: any) => void;
  onTaskListUpdate?: (taskLists: TaskList[]) => void;
}

interface Comment {
  id: number;
  taskId: number;
  author: { name: string; avatar: string };
  content: string;
  timestamp: string;
  attachments: Array<{
    id: number;
    name: string;
    type: string;
    size: number;
    url?: string;
  }>;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onViewChange, onTaskListUpdate }) => {
  // Use project's task lists directly from props
  const [taskLists, setTaskLists] = useState<TaskList[]>(project.taskLists || []);

  // Update local state when project changes
  useEffect(() => {
    setTaskLists(project.taskLists || []);
  }, [project.taskLists]);

  const [selectedProjectTask, setSelectedProjectTask] = useState<Task | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState<number | null>(null);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  
  // Enhanced comments state with media support
  const [taskComments, setTaskComments] = useState<Comment[]>([
    {
      id: 1,
      taskId: 1,
      author: { name: 'Sarah Johnson', avatar: 'SJ' },
      content: 'Started working on the wireframes. Here are some initial concepts and reference materials.',
      timestamp: '2024-02-08T10:30:00Z',
      attachments: [
        { id: 1, name: 'wireframe-concept-1.jpg', type: 'image/jpeg', size: 245760 },
        { id: 2, name: 'design-reference.png', type: 'image/png', size: 512000 }
      ]
    },
    {
      id: 2,
      taskId: 1,
      author: { name: 'Mike Chen', avatar: 'MC' },
      content: 'Great progress! I recorded a quick walkthrough of the current prototype. Please review and let me know your thoughts.',
      timestamp: '2024-02-08T14:15:00Z',
      attachments: [
        { id: 3, name: 'prototype-walkthrough.mp4', type: 'video/mp4', size: 15728640 }
      ]
    },
    {
      id: 3,
      taskId: 1,
      author: { name: 'Emily Rodriguez', avatar: 'ER' },
      content: 'The wireframes look good! I have some feedback on the user flow.',
      timestamp: '2024-02-08T16:45:00Z',
      attachments: []
    }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status options for the dropdown
  const statusOptions = taskLists.map(list => ({
    value: list.name,
    label: list.name,
    color: getStatusColorFromTaskList(list)
  }));

  function getStatusColorFromTaskList(taskList: TaskList): string {
    const colorMap: { [key: string]: string } = {
      'bg-gray-100': 'bg-gray-100 text-gray-800',
      'bg-blue-100': 'bg-blue-100 text-blue-800',
      'bg-yellow-100': 'bg-yellow-100 text-yellow-800',
      'bg-green-100': 'bg-green-100 text-green-800',
      'bg-red-100': 'bg-red-100 text-red-800',
      'bg-purple-100': 'bg-purple-100 text-purple-800',
      'bg-indigo-100': 'bg-indigo-100 text-indigo-800',
      'bg-pink-100': 'bg-pink-100 text-pink-800'
    };
    return colorMap[taskList.color] || 'bg-gray-100 text-gray-800';
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityOrder = (priority: string): number => {
    switch (priority) {
      case 'urgent': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      default: return 5;
    }
  };

  const getTaskTypeIcon = (taskType: string): string => {
    switch (taskType) {
      case 'general': return '📝';
      case 'equipmentId': return '🔧';
      case 'customerName': return '👤';
      case 'feature': return '✨';
      case 'bug': return '🐛';
      case 'design': return '🎨';
      default: return '📝';
    }
  };

  const formatDateLocal = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatLastCommentTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }) + ' : ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isOverdue = (dueDate: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Get last comment for a task
  const getLastComment = (taskId: number): Comment | null => {
    const comments = taskComments.filter(comment => comment.taskId === taskId);
    if (comments.length === 0) return null;
    return comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  // Sort tasks by priority (urgent first) then alphabetically by title
  const sortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      const priorityDiff = getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });
  };

  const handleStatusChange = (taskId: number, newStatus: string): void => {
    const updatedTaskLists = [...taskLists];
    let taskToMove: Task | null = null;

    // Find the task and remove it from current list
    for (const list of updatedTaskLists) {
      const taskIndex = list.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        taskToMove = { ...list.tasks[taskIndex], status: newStatus };
        list.tasks.splice(taskIndex, 1);
        break;
      }
    }

    // Add task to new list
    if (taskToMove) {
      const targetList = updatedTaskLists.find(list => list.name === newStatus);
      if (targetList) {
        const newTaskListId = targetList.id;
        taskToMove.taskListId = newTaskListId;
        targetList.tasks.push(taskToMove);
        // Re-sort the target list
        targetList.tasks = sortTasks(targetList.tasks);
      }

      // Update the selected task if it's currently being viewed
      if (selectedProjectTask && selectedProjectTask.id === taskId) {
        setSelectedProjectTask(taskToMove);
      }
    }

    setTaskLists(updatedTaskLists);
    onTaskListUpdate?.(updatedTaskLists);
  };

  const handleViewTask = (task: Task): void => {
    setSelectedProjectTask(task);
    setShowViewTaskModal(true);
    setShowTaskMenu(null);
  };

  const handleEditTask = (task: Task): void => {
    setSelectedProjectTask(task);
    setShowTaskMenu(null);
    onViewChange('edit-task', task);
  };

  const handleDeleteTask = (taskId: number): void => {
    const updatedTaskLists = taskLists.map(list => ({
      ...list,
      tasks: list.tasks.filter(task => task.id !== taskId)
    }));
    setTaskLists(updatedTaskLists);
    onTaskListUpdate?.(updatedTaskLists);
    setShowTaskMenu(null);
  };

  const handleAddTask = (): void => {
    onViewChange('add-task', { 
      projectId: project.id, 
      taskLists: taskLists,
      project: project 
    });
  };

  // NEW: Handle adding task to specific task list
  const handleAddTaskToList = (taskListId: number): void => {
    onViewChange('add-task', { 
      projectId: project.id, 
      taskLists: taskLists,
      project: project,
      preSelectedTaskListId: taskListId // Pass the pre-selected task list ID
    });
  };

  const handleAddTaskList = (): void => {
    onViewChange('add-task-list', { 
      projectId: project.id, 
      project: project 
    });
  };

  const handleManageTaskLists = (): void => {
    onViewChange('manage-task-lists', { 
      projectId: project.id, 
      taskLists: taskLists,
      project: project 
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml',
        // Videos
        'video/mp4', 'video/quicktime', 'video/mov', 'video/avi', 'video/webm', 'video/mkv',
        // Documents
        'application/pdf', 'text/plain', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 100 * 1024 * 1024; // 100MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setCommentAttachments(prev => [...prev, ...validFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCommentAttachment = (index: number): void => {
    setCommentAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (file: File): Promise<void> => {
    const fileKey = `${file.name}-${file.size}`;
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Clear progress after upload
    setTimeout(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileKey];
        return newProgress;
      });
    }, 500);
  };

  const handleAddComment = async (): void => {
    if (!newComment.trim() && commentAttachments.length === 0) return;

    // Simulate file uploads
    const uploadPromises = commentAttachments.map(file => simulateUpload(file));
    await Promise.all(uploadPromises);

    const comment: Comment = {
      id: Date.now(),
      taskId: selectedProjectTask?.id || 0,
      author: { name: 'Current User', avatar: 'CU' },
      content: newComment,
      timestamp: new Date().toISOString(),
      attachments: commentAttachments.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file) // In real app, this would be the uploaded file URL
      }))
    };

    setTaskComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentAttachments([]);
  };

  const getFileIcon = (fileType: string): React.ReactNode => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType === 'application/pdf' || fileType.includes('document')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const getFileTypeColor = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'bg-green-100 text-green-600';
    if (fileType.startsWith('video/')) return 'bg-purple-100 text-purple-600';
    if (fileType === 'application/pdf') return 'bg-red-100 text-red-600';
    if (fileType.includes('document')) return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const AttachmentPreview = ({ attachment }: { attachment: any }) => {
    const isImage = attachment.type.startsWith('image/');
    const isVideo = attachment.type.startsWith('video/');

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isImage && attachment.url && (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <img 
              src={attachment.url} 
              alt={attachment.name}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        )}
        
        {isVideo && attachment.url && (
          <div className="aspect-video bg-gray-100">
            <video 
              controls 
              className="w-full h-full object-contain"
              preload="metadata"
            >
              <source src={attachment.url} type={attachment.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded ${getFileTypeColor(attachment.type)}`}>
              {getFileIcon(attachment.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ViewTaskModal = ({ task, onClose }: { task: Task | null; onClose: () => void }) => {
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    
    if (!task) return null;

    const taskCommentsForTask = taskComments.filter(comment => comment.taskId === task.id);
    const currentStatus = statusOptions.find(status => status.value === task.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getTaskTypeIcon(task.taskType)}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{task.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{task.assignedTo.avatar}</span>
                    </div>
                    <span>Assigned to {task.assignedTo.name}</span>
                  </div>
                  {task.startDate && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Start: {formatDateLocal(task.startDate)}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className={`flex items-center space-x-1 ${
                      isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-600' : ''
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formatDateLocal(task.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                {/* Status Dropdown */}
                {statusOptions.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        currentStatus ? currentStatus.color : 'bg-gray-100 text-gray-800'
                      } hover:shadow-sm`}
                    >
                      <span>{task.status}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showStatusDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => {
                              handleStatusChange(task.id, status.value);
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              task.status === status.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{status.label}</span>
                              {task.status === status.value && <span className="text-blue-600">✓</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activity & Comments ({taskCommentsForTask.length})
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  {task.attachments > 0 && (
                    <div className="flex items-center space-x-1">
                      <Paperclip className="w-4 h-4" />
                      <span>{task.attachments} attachments</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6 mb-8">
                {taskCommentsForTask.length > 0 ? (
                  taskCommentsForTask.map(comment => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">{comment.author.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                            <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                          </div>
                          
                          {comment.content && (
                            <p className="text-sm text-gray-700 mb-4">{comment.content}</p>
                          )}
                          
                          {comment.attachments.length > 0 && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {comment.attachments.map((attachment) => (
                                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
                    <p className="text-sm">Start the conversation by adding the first comment!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">CU</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    
                    {/* Comment Attachments Preview */}
                    {commentAttachments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Attachments ({commentAttachments.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {commentAttachments.map((file, index) => {
                            const fileKey = `${file.name}-${file.size}`;
                            const progress = uploadProgress[fileKey];
                            
                            return (
                              <div key={index} className="relative bg-gray-50 rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <div className={`p-1 rounded ${getFileTypeColor(file.type)}`}>
                                      {getFileIcon(file.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeCommentAttachment(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                {/* Upload Progress */}
                                {progress !== undefined && progress < 100 && (
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Attach Files</span>
                        </button>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Image className="w-3 h-3" />
                            <span>Images</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="w-3 h-3" />
                            <span>Videos</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>Documents</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() && commentAttachments.length === 0}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        <span>Comment</span>
                      </button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Supported:</strong> Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, WebM), Documents (PDF, DOC, TXT) • <strong>Max size:</strong> 100MB per file
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {project.status}
              </span>
              <button 
                onClick={handleAddTaskList}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add List</span>
              </button>
              {taskLists.length > 0 && (
                <>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {taskLists.length > 0 ? (
          /* Task Lists with Tasks */
          <div className="space-y-8">
            {taskLists.map((taskList) => (
              <div key={taskList.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Task List Header */}
                <div className={`px-6 py-4 rounded-t-lg border-b border-gray-200 ${taskList.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{taskList.name}</h2>
                      {taskList.description && (
                        <p className="text-sm text-gray-600 mt-1">{taskList.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                        {taskList.tasks.length} {taskList.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                      <button
                        onClick={() => handleAddTaskToList(taskList.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-sm font-medium"
                        title={`Add task to ${taskList.name}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="divide-y divide-gray-100">
                  {sortTasks(taskList.tasks).length > 0 ? (
                    sortTasks(taskList.tasks).map((task) => {
                      const lastComment = getLastComment(task.id);
                      
                      return (
                        <div
                          key={task.id}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center space-x-4 flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleViewTask(task)}
                            >
                              <div className="flex-shrink-0">
                                <span className="text-lg">{getTaskTypeIcon(task.taskType)}</span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-base font-medium text-gray-900">{task.title}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600">{task.assignedTo.avatar}</span>
                                    </div>
                                    <span>{task.assignedTo.name}</span>
                                  </div>
                                  
                                  {task.dueDate && (
                                    <div className={`flex items-center space-x-1 ${
                                      isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-600' : ''
                                    }`}>
                                      <Calendar className="w-3 h-3" />
                                      <span>Due: {formatDateLocal(task.dueDate)}</span>
                                    </div>
                                  )}
                                  
                                  {task.attachments > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Paperclip className="w-3 h-3" />
                                      <span>{task.attachments}</span>
                                    </div>
                                  )}
                                  
                                  {task.comments > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <MessageSquare className="w-3 h-3" />
                                      <span>{task.comments}</span>
                                    </div>
                                  )}

                                  {/* Show Last Comment */}
                                  {lastComment && (
                                    <div className="flex items-center space-x-1 text-blue-600">
                                      <MessageSquare className="w-3 h-3" />
                                      <span>Last Comment - {formatLastCommentTime(lastComment.timestamp)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewTask(task)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Task"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit Task"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTaskMenu(showTaskMenu === task.id ? null : task.id);
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="More Options"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {showTaskMenu === task.id && (
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                                    <div className="px-3 py-1 text-xs text-gray-500 font-medium">Move to:</div>
                                    {taskLists.map((targetList) => (
                                      <button
                                        key={targetList.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(task.id, targetList.name);
                                          setShowTaskMenu(null);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                                          task.status === targetList.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                                        }`}
                                        disabled={task.status === targetList.name}
                                      >
                                        {targetList.name} {task.status === targetList.name && '✓'}
                                      </button>
                                    ))}
                                    
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Delete Task
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm">No tasks in {taskList.name}</p>
                      <button
                        onClick={() => handleAddTaskToList(taskList.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
          /* Empty State - No Task Lists */
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <List className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Task Lists Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by creating your first task list to organize your project tasks. 
              You can create lists like "To Do", "In Progress", "Review", or any custom workflow that fits your project.
            </p>
            <button
              onClick={handleAddTaskList}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Task List
            </button>
          </div>
        )}
      </div>

      {/* View Task Modal */}
      {showViewTaskModal && selectedProjectTask && (
        <ViewTaskModal
          task={selectedProjectTask}
          onClose={() => {
            setShowViewTaskModal(false);
            setSelectedProjectTask(null);
          }}
        />
      )}

      {/* Click outside to close menu */}
      {showTaskMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowTaskMenu(null)}
        />
      )}
    </div>
  );
};

export default ProjectDetail;