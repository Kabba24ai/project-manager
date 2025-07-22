import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Upload, X, Search, ChevronDown, Calendar, User, Flag } from 'lucide-react';
import { ViewType, TaskList, Task } from '../types';

interface AddTaskFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
  selectedProject?: any;
  onTaskCreated?: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onViewChange, selectedProject, onTaskCreated }) => {
  // Mock project settings - this would come from the selected project
  const [projectSettings] = useState({
    taskTypes: {
      general: true,
      equipmentId: true,
      customerName: true
    },
    allowFileUploads: true
  });

  // Get task lists from the selected project data - NO DEFAULT LISTS
  const [taskLists] = useState<TaskList[]>(selectedProject?.taskLists || []);

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
    taskType: '',
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    sprintId: '',
    taskListId: selectedProject?.preSelectedTaskListId?.toString() || '', // Pre-select if provided
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
    
    if (formData.taskType === 'general' && !formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (formData.taskType === 'equipmentId' && !formData.equipmentId) {
      newErrors.equipmentId = 'Please select an equipment item';
    }
    
    if (formData.taskType === 'customerName' && !formData.customerId) {
      newErrors.customerId = 'Please select a customer';
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
      let response;
      
      if (formData.attachments.length > 0) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('priority', formData.priority.toLowerCase());
        formDataToSend.append('task_type', formData.taskType);
        formDataToSend.append('assigned_to', formData.assignedTo);
        
        if (formData.startDate) formDataToSend.append('start_date', formData.startDate);
        if (formData.dueDate) formDataToSend.append('due_date', formData.dueDate);
        if (formData.sprintId) formDataToSend.append('sprint_id', formData.sprintId);
        
        // Add tags
        formData.tags?.forEach((tag, index) => {
          formDataToSend.append(`tags[${index}]`, tag);
        });
        
        // Add equipment/customer data
        if (formData.equipmentId) formDataToSend.append('equipment_id', formData.equipmentId);
        if (formData.customerId) formDataToSend.append('customer_id', formData.customerId);
        
        // Add attachments
        formData.attachments.forEach((file, index) => {
          formDataToSend.append(`attachments[${index}]`, file);
        });
        
        response = await apiService.createTaskWithAttachments(parseInt(formData.taskListId), formDataToSend);
      } else {
        // Regular JSON request without files
        const taskData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority.toLowerCase(),
          task_type: formData.taskType,
          assigned_to: parseInt(formData.assignedTo),
          start_date: formData.startDate || null,
          due_date: formData.dueDate || null,
          estimated_hours: null,
          tags: formData.tags || [],
          equipment_id: formData.equipmentId ? parseInt(formData.equipmentId) : null,
          customer_id: formData.customerId ? parseInt(formData.customerId) : null,
        };
        
        response = await apiService.createTask(parseInt(formData.taskListId), taskData);
      }
      
      if (response.data?.task) {
        // Convert API response to frontend Task format
        const apiTask = response.data.task;
        const assignedUser = users.find(user => user.id === apiTask.assigned_to?.id) || users[0];
        const selectedTaskList = taskLists.find(list => list.id === apiTask.task_list_id);
        
        const newTask: Task = {
          id: apiTask.id,
          title: apiTask.title,
          description: apiTask.description,
          priority: apiTask.priority,
          status: selectedTaskList?.name || apiTask.status,
          assignedTo: assignedUser,
          projectId: apiTask.project_id,
          taskListId: apiTask.task_list_id,
          dueDate: apiTask.due_date,
          startDate: apiTask.start_date,
          createdAt: apiTask.created_at,
          updatedAt: apiTask.updated_at,
          attachments: apiTask.attachments_count || formData.attachments.length,
          comments: apiTask.comments_count || 0,
          taskType: apiTask.task_type,
          tags: apiTask.tags || [],
          estimatedHours: apiTask.estimated_hours || 0
        };
        
        onTaskCreated?.(newTask);
      } else {
        // Fallback to mock data creation
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
          taskType: formData.taskType,
          tags: [],
          estimatedHours: 0
        };
        
        onTaskCreated?.(newTask);
      }
      
      // Success - redirect back to project view
      onViewChange(selectedProject ? 'project-detail' : 'dashboard');
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Fallback to mock data if API fails
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
        taskType: formData.taskType,
        tags: [],
        estimatedHours: 0
      };
      
      onTaskCreated?.(newTask);
      onViewChange(selectedProject ? 'project-detail' : 'dashboard');
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

  // Helper functions for step visibility
  const availableTaskTypes = Object.entries(projectSettings.taskTypes)
    .filter(([_, enabled]) => enabled)
    .map(([type, _]) => type);

  const canShowStep2 = formData.taskType !== '';
  
  const canShowStep3 = () => {
    if (formData.taskType === 'general' && formData.title) return true;
    if (formData.taskType === 'equipmentId' && formData.equipmentId) return true;
    if (formData.taskType === 'customerName' && formData.customerId) return true;
    return false;
  };

  const canShowStep4 = canShowStep3() && formData.description;
  const canShowActions = formData.taskType && formData.description && formData.assignedTo && formData.taskListId;

  // Get equipment list based on category filter
  const getEquipmentList = () => {
    if (!formData.equipmentCategory) {
      return allEquipment; // Show all equipment if no category selected
    }
    const selectedCategory = equipmentCategories.find(cat => cat.id.toString() === formData.equipmentCategory);
    return selectedCategory ? selectedCategory.equipment : [];
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(formData.customerSearch.toLowerCase())
  );

  const getSelectedTaskList = () => {
    return taskLists.find(list => list.id.toString() === formData.taskListId.toString());
  };

  // Check if we have task lists available
  if (taskLists.length === 0) {
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
            </div>
          </div>
        </div>

        {/* No Task Lists Message */}
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center bg-white rounded-lg border border-gray-200 p-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Task Lists Available</h3>
            <p className="text-gray-500 mb-6">
              You need to create at least one task list before you can add tasks. 
              Task lists help organize your work into categories like "To Do", "In Progress", etc.
            </p>
            <button
              onClick={() => onViewChange('add-task-list', selectedProject)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Task List First
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {selectedProject?.project?.name && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-gray-600">{selectedProject.project.name}</span>
              </>
            )}
            {/* Show pre-selected task list in header if available */}
            {formData.taskListId && getSelectedTaskList() && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">to</span>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getSelectedTaskList().color}`}>
                    {getSelectedTaskList().name}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Step 1: Task Type Selection - Always Required */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <h2 className="text-lg font-semibold text-gray-900">Select Task Type</h2>
            </div>
            <p className="text-gray-600 mb-6">Choose the type of task you want to create.</p>
            
            <div className="grid grid-cols-3 gap-4">
              {availableTaskTypes.includes('general') && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip('general')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      taskType: 'general',
                      title: '',
                      equipmentCategory: '',
                      equipmentId: '',
                      customerSearch: '',
                      customerId: ''
                    }))}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-center ${
                      formData.taskType === 'general' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      formData.taskType === 'general' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900">General</h3>
                  </button>
                  
                  {showTooltip === 'general' && (
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                      <div className="text-center">
                        Standard project task with manually entered details. Perfect for development, design, or administrative tasks.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              )}
              
              {availableTaskTypes.includes('equipmentId') && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip('equipment')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      taskType: 'equipmentId',
                      title: '',
                      equipmentCategory: '',
                      equipmentId: '',
                      customerSearch: '',
                      customerId: ''
                    }))}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-center ${
                      formData.taskType === 'equipmentId' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      formData.taskType === 'equipmentId' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900">Equipment ID</h3>
                  </button>
                  
                  {showTooltip === 'equipment' && (
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                      <div className="text-center">
                        Task related to specific rental equipment. Links directly to your equipment inventory and rental system.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              )}
              
              {availableTaskTypes.includes('customerName') && (
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip('customer')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      taskType: 'customerName',
                      title: '',
                      equipmentCategory: '',
                      equipmentId: '',
                      customerSearch: '',
                      customerId: ''
                    }))}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-center ${
                      formData.taskType === 'customerName' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      formData.taskType === 'customerName' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900">Customer</h3>
                  </button>
                  
                  {showTooltip === 'customer' && (
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                      <div className="text-center">
                        Task linked to a specific customer. Perfect for customer support, follow-ups, or customer-specific projects.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Task Details - Only show after task type is selected */}
          {canShowStep2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formData.taskType === 'general' && 'General Task Details'}
                  {formData.taskType === 'equipmentId' && 'Equipment Selection'}
                  {formData.taskType === 'customerName' && 'Customer Selection'}
                </h2>
              </div>
              
              <div className="space-y-6">
                {/* Task Title/Selection */}
                {formData.taskType === 'general' && (
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
                )}

                {formData.taskType === 'equipmentId' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="equipmentCategory" className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Category (Optional Filter)
                      </label>
                      <select
                        id="equipmentCategory"
                        name="equipmentCategory"
                        value={formData.equipmentCategory}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">All Categories</option>
                        {equipmentCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Item *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEquipmentDropdown(!showEquipmentDropdown)}
                          className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
                            errors.equipmentId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <span className={formData.equipmentId ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.equipmentId 
                              ? getEquipmentList().find(eq => eq.id === formData.equipmentId)?.name
                              : 'Select equipment'
                            }
                          </span>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {showEquipmentDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {getEquipmentList().map(equipment => (
                              <button
                                key={equipment.id}
                                type="button"
                                onClick={() => handleEquipmentSelect(equipment)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                              >
                                <span className="text-gray-900">{equipment.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  equipment.available 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {equipment.available ? 'Available' : 'Rented'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.equipmentId && (
                        <p className="mt-2 text-sm text-red-600">{errors.equipmentId}</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.taskType === 'customerName' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer *
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.customerSearch}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, customerSearch: e.target.value, customerId: '' }));
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Search customers..."
                        />
                      </div>
                      
                      {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCustomers.map(customer => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleCustomerSelect(customer)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email} • {customer.phone}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.customerId && (
                      <p className="mt-2 text-sm text-red-600">{errors.customerId}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Additional Task Information */}
          {canShowStep3() && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <h2 className="text-lg font-semibold text-gray-900">Task Information</h2>
              </div>
              
              <div className="space-y-6">
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

                {/* Priority, Assigned To, Sprint Assignment */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <div className={`mt-1 px-2 py-1 rounded-full text-xs inline-block border ${getPriorityColor(formData.priority)}`}>
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select member</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="mt-1 text-xs text-red-600">{errors.assignedTo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="sprintId" className="block text-sm font-medium text-gray-700 mb-2">
                      Sprint (Optional)
                    </label>
                    <select
                      id="sprintId"
                      name="sprintId"
                      value={formData.sprintId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    >
                      <option value="">No sprint</option>
                      {sprints.map(sprint => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Date, Due Date, Task List */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="taskListId" className="block text-sm font-medium text-gray-700 mb-2">
                      Task List *
                    </label>
                    <select
                      id="taskListId"
                      name="taskListId"
                      value={formData.taskListId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.taskListId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select task list</option>
                      {taskLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                    {errors.taskListId && (
                      <p className="mt-1 text-xs text-red-600">{errors.taskListId}</p>
                    )}
                    
                    {/* Show selected task list preview */}
                    {formData.taskListId && getSelectedTaskList() && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border">
                        <div className={`text-xs px-2 py-1 rounded ${getSelectedTaskList().color}`}>
                          <strong>{getSelectedTaskList().name}</strong>
                          {getSelectedTaskList().description && (
                            <div className="text-gray-600 mt-1">{getSelectedTaskList().description}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: File Attachments */}
          {projectSettings.allowFileUploads && canShowStep4 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <h2 className="text-lg font-semibold text-gray-900">Attachments (Optional)</h2>
              </div>
              <p className="text-gray-600 mb-4">Add photos, videos, or PDF documents to support this task.</p>
              
              <div className="space-y-4">
                {/* Upload Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Files</span>
                  </button>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">🖼️</span>
                      <span>Photos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">🎥</span>
                      <span>Videos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">📄</span>
                      <span>PDFs</span>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <p className="text-sm text-gray-500">
                  <strong>Supported formats:</strong> JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM, PDF<br />
                  <strong>Maximum size:</strong> 50MB per file • <strong>Multiple files:</strong> Supported
                </p>

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Attached Files ({formData.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getFileTypeColor(file)}`}>
                              {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="capitalize">
                                  {file.type.startsWith('image/') && 'Photo'}
                                  {file.type.startsWith('video/') && 'Video'}
                                  {file.type === 'application/pdf' && 'PDF'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Summary */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Upload className="w-4 h-4" />
                        <span>
                          {formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''} ready to upload
                        </span>
                      </div>
                      <div className="text-sm text-blue-600">
                        Total: {(formData.attachments.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Drag & Drop Zone */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    handleFileUpload({ target: { files } });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Drop files here</span> or click Upload Files above
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Photos, Videos, and PDFs accepted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {canShowActions && (
            <div className="flex items-center justify-end space-x-4">
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
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;