import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Upload, X, Search, ChevronDown, Calendar, User, Flag } from 'lucide-react';
import { ViewType, TaskList, Task } from '../types';

interface AddTaskFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
  selectedProject?: any;
  preSelectedTaskListId?: string | number;
  taskLists?: TaskList[];
  onTaskCreated?: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ 
  onViewChange, 
  selectedProject, 
  preSelectedTaskListId,
  taskLists = [],
  onTaskCreated 
}) => {
  console.log('🎨 AddTaskForm rendered with:');
  console.log('🏗️ - selectedProject:', selectedProject);
  console.log('🎯 - preSelectedTaskListId:', preSelectedTaskListId);
  console.log('📋 - taskLists:', taskLists);
  console.log('📊 - taskLists length:', taskLists?.length);
  console.log('📝 - taskLists structure:', taskLists?.map(list => ({ id: list.id, name: list.name, projectId: list.projectId })));

  // Mock project settings - this would come from the selected project
  const [projectSettings] = useState({
    taskTypes: {
      general: true,
      equipmentId: true,
      customerName: true
    },
    allowFileUploads: true
  });

  // Mock data - these would come from API calls
  const [users] = useState([
    { id: 1, name: 'John Smith', role: 'Developer', avatar: 'JS' },
    { id: 2, name: 'Sarah Johnson', role: 'Designer', avatar: 'SJ' },
    { id: 3, name: 'Mike Chen', role: 'Project Manager', avatar: 'MC' },
    { id: 4, name: 'Emily Davis', role: 'Tester', avatar: 'ED' }
  ]);

  const [sprints] = useState([
    { id: 1, name: 'Sprint 1 - Setup & Planning', status: 'Active' },
    { id: 2, name: 'Sprint 2 - Core Development', status: 'Planned' },
    { id: 3, name: 'Sprint 3 - Testing & Polish', status: 'Planned' }
  ]);

  // Mock equipment data - placeholder for rental system integration (sorted alphabetically)
  const [equipmentCategories] = useState([
    { 
      id: 1, 
      name: 'Construction Equipment',
      equipment: [
        { id: 103, name: 'Bobcat Skid Steer - #SKI003', available: true },
        { id: 101, name: 'CAT 320 Excavator - #EXC001', available: true },
        { id: 102, name: 'John Deere Bulldozer - #BUL002', available: false }
      ]
    },
    { 
      id: 2, 
      name: 'Power Tools',
      equipment: [
        { id: 201, name: 'DeWalt Hammer Drill - #DRL001', available: true },
        { id: 202, name: 'Makita Circular Saw - #SAW002', available: true }
      ]
    }
  ].sort((a, b) => a.name.localeCompare(b.name)));

  // All equipment in one list (alphabetically sorted)
  const allEquipment = equipmentCategories
    .flatMap(category => category.equipment)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Mock customer data - placeholder for customer portal integration (sorted alphabetically)
  const [customers] = useState([
    { id: 1, name: 'ABC Construction Co.', email: 'contact@abcconstruction.com', phone: '(555) 123-4567' },
    { id: 3, name: 'Smith & Associates', email: 'office@smithassoc.com', phone: '(555) 456-7890' },
    { id: 2, name: 'XYZ Builders Inc.', email: 'info@xyzbuilders.com', phone: '(555) 987-6543' }
  ].sort((a, b) => a.name.localeCompare(b.name)));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    sprintId: '',
    taskListId: preSelectedTaskListId?.toString() || '',
    equipmentCategory: '',
    equipmentId: '',
    customerSearch: '',
    customerId: '',
    startDate: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset related fields when task type changes
    if (name === 'taskType') {
      setFormData(prev => ({
        ...prev,
        title: '',
        equipmentCategory: '',
        equipmentId: '',
        customerSearch: '',
        customerId: ''
      }));
    }

    // Reset equipment selection when category changes
    if (name === 'equipmentCategory') {
      setFormData(prev => ({
        ...prev,
        equipmentId: '',
        title: ''
      }));
    }
  };

  const handleEquipmentSelect = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipmentId: equipment.id,
      title: equipment.name
    }));
    setShowEquipmentDropdown(false);
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerSearch: customer.name,
      title: `Task for ${customer.name}`
    }));
    setShowCustomerDropdown(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Accept photos, videos, and PDFs
      const validTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
        // Videos
        'video/mp4', 'video/quicktime', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv',
        // PDFs
        'application/pdf'
      ];
      const maxSize = 50 * 1024 * 1024; // 50MB max for videos, smaller files for others
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        console.warn(`File ${file.name} is not a supported type. Supported: Photos, Videos, PDFs`);
        return false;
      }
      if (!isValidSize) {
        console.warn(`File ${file.name} is too large. Maximum size: 50MB`);
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
    
    // Clear the input so the same file can be selected again if needed
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign the task to a team member';
    }

    if (!formData.taskListId) {
      newErrors.taskListId = 'Please select a task list';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assignedUser = users.find(user => user.id.toString() === formData.assignedTo.toString());
      const selectedTaskList = taskLists.find(list => list.id.toString() === formData.taskListId.toString());
      
      const newTask: Task = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        priority: formData.priority.toLowerCase(),
        status: selectedTaskList?.name || 'To Do',
        assignedTo: assignedUser || users[0],
        projectId: selectedProject?.id || 1,
        taskListId: parseInt(formData.taskListId),
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: formData.attachments.length,
        comments: 0,
        taskType: 'general',
        tags: [],
        estimatedHours: 0
      };
      
      onTaskCreated?.(newTask);
      onViewChange(selectedProject ? 'project-detail' : 'dashboard');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onViewChange(selectedProject ? 'project-detail' : 'dashboard');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileIcon = (file) => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.startsWith('video/')) {
      return '🎥';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
  };

  const getFileTypeColor = (file) => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) {
      return 'bg-green-100 text-green-600';
    } else if (fileType.startsWith('video/')) {
      return 'bg-purple-100 text-purple-600';
    } else if (fileType === 'application/pdf') {
      return 'bg-red-100 text-red-600';
    }
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info - Remove in production */}
      <div className="bg-yellow-50 border border-yellow-200 p-2 text-xs">
        <strong>Debug:</strong> Project: {selectedProject?.name || 'None'}, 
        TaskLists: {taskLists?.length || 0}, 
        PreSelected: {preSelectedTaskListId || 'None'}
      </div>
      
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Task Title */}
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
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
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
                placeholder="Describe the task requirements and goals"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Priority, Assigned To, Due Date */}
            <div className="grid grid-cols-3 gap-4">
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
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <div className={`mt-2 px-3 py-1 rounded-full text-xs inline-block border ${getPriorityColor(formData.priority)}`}>
                  {formData.priority} Priority
                </div>
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
                >
                  <option value="">Select team member</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.assignedTo && (
                  <p className="mt-2 text-sm text-red-600">{errors.assignedTo}</p>
                )}
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Task List Selection */}
            <div>
              <label htmlFor="taskListId" className="block text-sm font-medium text-gray-700 mb-2">
                Task List *
              </label>
              {taskLists && taskLists.length > 0 ? (
                <select
                  id="taskListId"
                  name="taskListId"
                  value={formData.taskListId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.taskListId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a task list</option>
                  {taskLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({(list.tasks || []).length} tasks)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">No Task Lists Available</p>
                  <div className="text-red-600 text-xs mt-2 space-y-1">
                    <p><strong>Debug Info:</strong></p>
                    <p>• Project: {selectedProject?.name || 'Unknown'}</p>
                    <p>• Project ID: {selectedProject?.id || 'Unknown'}</p>
                    <p>• TaskLists received: {taskLists?.length || 0}</p>
                    <p>• TaskLists type: {typeof taskLists}</p>
                    <p>• TaskLists array: {JSON.stringify(taskLists)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewChange('add-task-list')}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Create Task List First
                  </button>
                </div>
              )}
              {errors.taskListId && (
                <p className="mt-2 text-sm text-red-600">{errors.taskListId}</p>
              )}
            </div>

            {/* File Attachments */}
            {projectSettings.allowFileUploads && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Files</span>
                    </button>
                    <span className="text-sm text-gray-500">
                      Photos, Videos, PDFs (Max 50MB each)
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${getFileTypeColor(file)}`}>
                              {getFileIcon(file)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
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
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Creating...</span>
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
    </div>
  );
};

export default AddTaskForm;