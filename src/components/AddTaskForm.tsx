import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Calendar, Users, Flag, Settings, Plus, Minus, AlertCircle } from 'lucide-react';
import { ViewType, Task, TaskList } from '../types';
import { useUsers } from '../hooks/useApi';
import apiService from '../services/api';

interface AddTaskFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
  selectedProject?: any;
  preSelectedTaskListId?: number;
  taskLists: TaskList[];
  onTaskCreated: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ 
  onViewChange, 
  selectedProject, 
  preSelectedTaskListId,
  taskLists, 
  onTaskCreated 
}) => {
  console.log('🎯 AddTaskForm: Component mounted');
  console.log('📦 AddTaskForm: Props received:', { 
    selectedProject: selectedProject?.name, 
    preSelectedTaskListId,
    taskListsCount: taskLists?.length 
  });

  // API hooks
  const { users: availableUsers, loading: usersLoading, fetchUsers } = useUsers();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    taskType: 'general',
    assignedTo: '',
    taskListId: preSelectedTaskListId?.toString() || '',
    startDate: '',
    dueDate: '',
    estimatedHours: '',
    tags: [],
    equipmentId: '',
    customerId: '',
    sprintId: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef(null);
  const [equipment, setEquipment] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Load data on component mount
  useEffect(() => {
    console.log('🔄 AddTaskForm: Loading initial data...');
    
    const loadData = async () => {
      try {
        // Load users
        await fetchUsers();
        console.log('✅ AddTaskForm: Users loaded');

        // Load equipment if task type supports it
        if (selectedProject?.settings?.taskTypes?.equipmentId) {
          setLoadingEquipment(true);
          try {
            const equipmentResponse = await apiService.getEquipment();
            setEquipment(equipmentResponse.data?.equipment || []);
            console.log('✅ AddTaskForm: Equipment loaded:', equipmentResponse.data?.equipment?.length);
          } catch (error) {
            console.error('❌ AddTaskForm: Failed to load equipment:', error);
          } finally {
            setLoadingEquipment(false);
          }
        }

        // Load customers if task type supports it
        if (selectedProject?.settings?.taskTypes?.customerName) {
          setLoadingCustomers(true);
          try {
            const customersResponse = await apiService.getCustomers();
            setCustomers(customersResponse.data?.customers || []);
            console.log('✅ AddTaskForm: Customers loaded:', customersResponse.data?.customers?.length);
          } catch (error) {
            console.error('❌ AddTaskForm: Failed to load customers:', error);
          } finally {
            setLoadingCustomers(false);
          }
        }
      } catch (error) {
        console.error('❌ AddTaskForm: Failed to load initial data:', error);
      }
    };

    loadData();
  }, [fetchUsers, selectedProject]);

  // Set pre-selected task list when available
  useEffect(() => {
    if (preSelectedTaskListId && !formData.taskListId) {
      console.log('🎯 AddTaskForm: Setting pre-selected task list:', preSelectedTaskListId);
      setFormData(prev => ({
        ...prev,
        taskListId: preSelectedTaskListId.toString()
      }));
    }
  }, [preSelectedTaskListId, formData.taskListId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/mov', 'video/avi', 'video/webm',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const maxSize = 50 * 1024 * 1024; // 50MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.description.trim()) newErrors.description = 'Task description is required';
    if (!formData.taskListId) newErrors.taskListId = 'Task list is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned user is required';
    
    // Date validation
    if (formData.startDate && formData.dueDate && new Date(formData.startDate) >= new Date(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    // Task type specific validation
    if (formData.taskType === 'equipmentId' && !formData.equipmentId) {
      newErrors.equipmentId = 'Equipment selection is required for Equipment ID tasks';
    }
    
    if (formData.taskType === 'customerName' && !formData.customerId) {
      newErrors.customerId = 'Customer selection is required for Customer tasks';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('🚀 AddTaskForm: Starting task creation...');
    console.log('📝 AddTaskForm: Form data:', formData);
    console.log('📋 AddTaskForm: Available task lists:', taskLists);
    console.log('🎯 AddTaskForm: Pre-selected task list ID:', preSelectedTaskListId);
    
    if (!validateForm()) {
      console.log('❌ AddTaskForm: Form validation failed:', errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare task data for Laravel API
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        task_type: formData.taskType,
        assigned_to: parseInt(formData.assignedTo),
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        tags: formData.tags,
        equipment_id: formData.equipmentId ? parseInt(formData.equipmentId) : null,
        customer_id: formData.customerId ? parseInt(formData.customerId) : null,
      };

      console.log('🌐 AddTaskForm: Prepared task data for API:', taskData);
      console.log('📍 AddTaskForm: Target task list ID:', formData.taskListId);

      let response;
      
      if (formData.attachments.length > 0) {
        console.log('📎 AddTaskForm: Creating task with attachments...');
        // Create FormData for file upload
        const formDataWithFiles = new FormData();
        
        // Add task data
        Object.keys(taskData).forEach(key => {
          if (taskData[key] !== null && taskData[key] !== undefined) {
            if (key === 'tags') {
              formDataWithFiles.append(key, JSON.stringify(taskData[key]));
            } else {
              formDataWithFiles.append(key, taskData[key].toString());
            }
          }
        });
        
        // Add files
        formData.attachments.forEach((file, index) => {
          formDataWithFiles.append(`attachments[${index}]`, file);
        });
        
        response = await apiService.createTaskWithAttachments(parseInt(formData.taskListId), formDataWithFiles);
      } else {
        console.log('📝 AddTaskForm: Creating task without attachments...');
        response = await apiService.createTask(parseInt(formData.taskListId), taskData);
      }
      
      console.log('✅ AddTaskForm: Task creation successful:', response);
      
      // Convert API response to frontend Task format
      const newTask: Task = {
        id: response.data.task.id,
        title: response.data.task.title,
        description: response.data.task.description,
        priority: response.data.task.priority,
        status: response.data.task.status || 'To Do',
        assignedTo: response.data.task.assigned_to || {
          id: parseInt(formData.assignedTo),
          name: availableUsers.find(u => u.id === parseInt(formData.assignedTo))?.name || 'Unknown',
          email: availableUsers.find(u => u.id === parseInt(formData.assignedTo))?.email || '',
          avatar: availableUsers.find(u => u.id === parseInt(formData.assignedTo))?.avatar || 'U',
          role: availableUsers.find(u => u.id === parseInt(formData.assignedTo))?.role || 'developer'
        },
        projectId: selectedProject?.id || 1,
        taskListId: parseInt(formData.taskListId),
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        createdAt: response.data.task.created_at || new Date().toISOString(),
        updatedAt: response.data.task.updated_at || new Date().toISOString(),
        attachments: response.data.task.attachments_count || formData.attachments.length,
        comments: response.data.task.comments_count || 0,
        taskType: formData.taskType,
        tags: formData.tags,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        actualHours: undefined,
        feedback: undefined
      };
      
      // Update parent component
      onTaskCreated(newTask);
      
      // Show success message
      alert('Task created successfully!');
      
      // Navigate back to project detail
      onViewChange('project-detail', selectedProject);
      
    } catch (error) {
      console.error('❌ AddTaskForm: Task creation failed:', error);
      console.error('❌ AddTaskForm: Error details:', {
        message: error.message,
        formData,
        taskData: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          task_type: formData.taskType,
          assigned_to: parseInt(formData.assignedTo),
          start_date: formData.startDate || null,
          due_date: formData.dueDate || null,
          estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          tags: formData.tags,
          equipment_id: formData.equipmentId ? parseInt(formData.equipmentId) : null,
          customer_id: formData.customerId ? parseInt(formData.customerId) : null,
        }
      });
      
      // Show user-friendly error message
      if (error.message?.includes('Backend unavailable')) {
        alert('Backend server is not available. Please make sure Laravel backend is running with "php artisan serve"');
      } else if (error.message?.includes('USER_NOT_IN_TEAM')) {
        alert('The assigned user must be a member of the project team. Please select a different user.');
      } else if (error.message?.includes('validation')) {
        alert('Please check all required fields and try again.');
      } else {
        alert(`Failed to create task: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onViewChange('project-detail', selectedProject);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileIcon = (file) => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📎';
  };

  const getFileTypeColor = (file) => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) return 'bg-green-100 text-green-600';
    if (fileType.startsWith('video/')) return 'bg-purple-100 text-purple-600';
    if (fileType === 'application/pdf') return 'bg-red-100 text-red-600';
    if (fileType.includes('word')) return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getTaskTypeDescription = (taskType) => {
    switch (taskType) {
      case 'general': return 'Standard project tasks with manual entry';
      case 'equipmentId': return 'Tasks linked to specific equipment items';
      case 'customerName': return 'Tasks associated with specific customers';
      case 'feature': return 'New feature development tasks';
      case 'bug': return 'Bug fixes and issue resolution';
      case 'design': return 'Design and UI/UX related tasks';
      default: return 'General project tasks';
    }
  };

  // Get available task types based on project settings
  const getAvailableTaskTypes = () => {
    const types = [];
    
    if (selectedProject?.settings?.taskTypes?.general !== false) {
      types.push({ value: 'general', label: 'General Task' });
    }
    
    if (selectedProject?.settings?.taskTypes?.equipmentId) {
      types.push({ value: 'equipmentId', label: 'Equipment ID Task' });
    }
    
    if (selectedProject?.settings?.taskTypes?.customerName) {
      types.push({ value: 'customerName', label: 'Customer Task' });
    }
    
    // Always available task types
    types.push(
      { value: 'feature', label: 'Feature Development' },
      { value: 'bug', label: 'Bug Fix' },
      { value: 'design', label: 'Design Task' }
    );
    
    return types;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Project</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Task</h1>
            {selectedProject?.name && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-gray-600">{selectedProject.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {/* Task Basic Information */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter task title"
                />
                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe the task requirements, goals, and acceptance criteria"
                />
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>

            {/* Task Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className={`mt-2 px-3 py-1 rounded-full text-xs inline-block border ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </div>
              </div>

              <div>
                <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  id="taskType"
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {getAvailableTaskTypes().map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {getTaskTypeDescription(formData.taskType)}
                </p>
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="taskListId" className="block text-sm font-medium text-gray-700 mb-2">
                  Task List *
                </label>
                <select
                  id="taskListId"
                  name="taskListId"
                  value={formData.taskListId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.taskListId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select task list</option>
                  {taskLists.map(list => (
                    <option key={list.id} value={list.id.toString()}>
                      {list.name}
                    </option>
                  ))}
                </select>
                {errors.taskListId && <p className="mt-2 text-sm text-red-600">{errors.taskListId}</p>}
              </div>

              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To *
                </label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={usersLoading}
                >
                  <option value="">
                    {usersLoading ? 'Loading users...' : 'Select team member'}
                  </option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                {errors.assignedTo && <p className="mt-2 text-sm text-red-600">{errors.assignedTo}</p>}
                {usersLoading && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading team members...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Selection (if enabled) */}
            {formData.taskType === 'equipmentId' && (
              <div>
                <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment *
                </label>
                <select
                  id="equipmentId"
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.equipmentId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loadingEquipment}
                >
                  <option value="">
                    {loadingEquipment ? 'Loading equipment...' : 'Select equipment'}
                  </option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id.toString()}>
                      {item.display_name || `${item.name} (${item.code})`}
                    </option>
                  ))}
                </select>
                {errors.equipmentId && <p className="mt-2 text-sm text-red-600">{errors.equipmentId}</p>}
              </div>
            )}

            {/* Customer Selection (if enabled) */}
            {formData.taskType === 'customerName' && (
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loadingCustomers}
                >
                  <option value="">
                    {loadingCustomers ? 'Loading customers...' : 'Select customer'}
                  </option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id.toString()}>
                      {customer.display_name || `${customer.name} (${customer.company})`}
                    </option>
                  ))}
                </select>
                {errors.customerId && <p className="mt-2 text-sm text-red-600">{errors.customerId}</p>}
              </div>
            )}

            {/* Dates and Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && <p className="mt-2 text-sm text-red-600">{errors.dueDate}</p>}
              </div>

              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours (Optional)
                </label>
                <input
                  type="number"
                  id="estimatedHours"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Hours"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Add tags (e.g., frontend, urgent, review)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File Attachments */}
            {selectedProject?.settings?.allowFileUploads && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Files</span>
                    </button>
                    <span className="text-sm text-gray-500">
                      Images, videos, PDFs, and documents (max 50MB each)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Attached Files ({formData.attachments.length})
                      </h4>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getFileTypeColor(file)}`}>
                                {getFileIcon(file)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Project: {selectedProject?.name || 'None'}</div>
                  <div>Pre-selected Task List: {preSelectedTaskListId || 'None'}</div>
                  <div>Available Task Lists: {taskLists?.length || 0}</div>
                  <div>Available Users: {availableUsers?.length || 0}</div>
                  <div>Equipment Available: {equipment?.length || 0}</div>
                  <div>Customers Available: {customers?.length || 0}</div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || usersLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;