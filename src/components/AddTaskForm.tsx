import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Upload, X, Search, ChevronDown, Calendar, User, Flag, MessageSquare } from 'lucide-react';
import { ViewType, TaskList, Task } from '../types';
import { useUsers } from '../hooks/useApi';
import apiService from '../services/api';

interface AddTaskFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
  selectedProject?: any;
  preSelectedTaskListId?: number | null;
  onTaskCreated?: (task: Task) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onViewChange, selectedProject, preSelectedTaskListId, onTaskCreated }) => {
  // API hooks
  const { users: apiUsers, loading: usersLoading, fetchUsers } = useUsers();

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
  const [taskLists] = useState<TaskList[]>(selectedProject?.task_lists || []);

  // Real users from API
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Mock sprints - this would be replaced with real API call when sprint feature is implemented
  const [sprints] = useState([]);

  // Equipment data - placeholder for future equipment API integration
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  // All equipment in one list
  const allEquipment = equipmentCategories.flatMap(category => category.equipment || []);

  // Customer data - placeholder for future customer API integration
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState(null);

  const [formData, setFormData] = useState({
    taskType: '',
    title: '',
    description: '',
    priority: 'Medium',
    taskListId: preSelectedTaskListId || (taskLists?.[0]?.id) || '',
    dueDate: '',
    sprintId: '',
//    taskListId: '', // only placeholder initially
    equipmentCategory: '',
    equipmentId: '',
    customerSearch: '',
    customerId: '',
    startDate: '',
    attachments: [],
    assignedTo: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const fileInputRef = useRef(null);

  // Load users on component mount
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('🔄 AddTaskForm: Loading data...');
        console.log('📋 AddTaskForm: Available task lists:', taskLists);
        console.log('🎯 AddTaskForm: Pre-selected task list ID:', taskLists?.[0]?.id);
        console.log('🏗️ AddTaskForm: Selected project:', selectedProject);
        
        setLoadingUsers(true);
        await fetchUsers();
        
        // Auto-select first task list if none is preselected
        if (!preSelectedTaskListId && taskLists && taskLists.length > 0) {
          console.log('🎯 AddTaskForm: Auto-selecting first task list:', taskLists[0].id);
          setFormData(prev => ({
            ...prev,
            taskListId: taskLists[0].id.toString()
          }));
        } else if (preSelectedTaskListId) {
          console.log('🎯 AddTaskForm: Using pre-selected task list:', preSelectedTaskListId);
          setFormData(prev => ({
            ...prev,
            taskListId: preSelectedTaskListId.toString()
          }));
        }
        setUsers(apiUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
        // Fallback to empty array
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [fetchUsers]);

  // Load comments when task is created
  const loadComments = async (taskId) => {
    if (!taskId) return;
    
    setLoadingComments(true);
    try {
      console.log('🔄 AddTaskForm: Loading comments for task:', taskId);
      const response = await apiService.getComments(taskId);
      console.log('✅ AddTaskForm: Comments loaded:', response);
      
      const commentsData = response.data?.comments || response.comments || [];
      setComments(commentsData);
    } catch (error) {
      console.error('❌ AddTaskForm: Failed to load comments:', error);
      setComments([]); // Reset to empty array on error
    } finally {
      setLoadingComments(false);
    }
  };

  React.useEffect(() => {
    if (preSelectedTaskListId) {
      setFormData(prev => ({
        ...prev,
        taskListId: preSelectedTaskListId.toString()
      }));
    }
  }, [preSelectedTaskListId]);

  // Update users when API data changes
  React.useEffect(() => {
    if (apiUsers && apiUsers.length > 0) {
      setUsers(apiUsers);
      setLoadingUsers(false);
    }
  }, [apiUsers]);

  // Load equipment data (placeholder for future implementation)
  React.useEffect(() => {
    const loadEquipment = async () => {
      if (formData.taskType === 'equipmentId') {
        setLoadingEquipment(true);
        try {
          // TODO: Replace with real equipment API call
          // const response = await apiService.getEquipment();
          // setEquipmentCategories(response.data?.equipment_categories || []);
          
          // For now, use placeholder data
          setEquipmentCategories([
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
          ]);
        } catch (error) {
          console.error('Failed to load equipment:', error);
          setEquipmentCategories([]);
        } finally {
          setLoadingEquipment(false);
        }
      }
    };

    loadEquipment();
  }, [formData.taskType]);

  // Load customers data (placeholder for future implementation)
  React.useEffect(() => {
    const loadCustomers = async () => {
      if (formData.taskType === 'customerName') {
        setLoadingCustomers(true);
        try {
          // TODO: Replace with real customer API call
          // const response = await apiService.getCustomers();
          // setCustomers(response.data?.customers || []);
          
          // For now, use placeholder data
          setCustomers([
            { id: 1, name: 'ABC Construction Co.', email: 'contact@abcconstruction.com', phone: '(555) 123-4567' },
            { id: 3, name: 'Smith & Associates', email: 'office@smithassoc.com', phone: '(555) 456-7890' },
            { id: 2, name: 'XYZ Builders Inc.', email: 'info@xyzbuilders.com', phone: '(555) 987-6543' }
          ]);
        } catch (error) {
          console.error('Failed to load customers:', error);
          setCustomers([]);
        } finally {
          setLoadingCustomers(false);
        }
      }
    };

    loadCustomers();
  }, [formData.taskType]);

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !createdTaskId) return;
    
    setCommentLoading(true);
    try {
      const response = await apiService.addComment(createdTaskId, {
        content: newComment.trim()
      });
      
      if (response.data?.comment) {
        setComments(prev => [...prev, response.data.comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
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

    if (!formData.taskListId || formData.taskListId === '') {
      newErrors.taskListId = 'Please select a task list';
      console.error('❌ AddTaskForm: Task list validation failed');
      console.error('📋 AddTaskForm: Current taskListId:', formData.taskListId);
      console.error('📋 AddTaskForm: Available task lists:', taskLists);
      console.error('🎯 AddTaskForm: Pre-selected task list ID:', preSelectedTaskListId);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    console.log('🚀 AddTaskForm: Starting task creation...');
    console.log('📝 AddTaskForm: Form data:', formData);
    console.log('📋 AddTaskForm: Selected task list ID:', preSelectedTaskListId);
    console.log('🏗️ AddTaskForm: Project:', selectedProject);
    
    setLoading(true);
    
    try {
      // Get the selected task list
      /*
      const selectedTaskList = taskLists.find(list => list.id.toString() === formData.taskListId.toString());
      */
      const selectedTaskList = taskLists.find(
        list => list.id.toString() === formData.taskListId.toString()
      );
      if (!selectedTaskList) {
        throw new Error('Selected task list not found');
      }
      console.log('🎯 AddTaskForm: Pre-selected task list ID:', preSelectedTaskListId || 'None');
      if (!selectedTaskList) {
        throw new Error('Selected task list not found');
      }

      // Validate required data
      /*
      if (!preSelectedTaskListId) {
        throw new Error('No task list selected');
      }
        */
      if (!formData.taskListId) {
        throw new Error('No task list selected');
      }
      
      if (!selectedProject?.id) {
        throw new Error('No project selected');
      }
      
      // Always use the regular createTask endpoint and handle attachments separately
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority.toLowerCase(), // Convert to lowercase for Laravel enum
        task_type: formData.taskType, // Keep as is (general, equipmentId, etc.)
        assigned_to: parseInt(formData.assignedTo), // Convert to integer
        start_date: formData.startDate || null,
        due_date: formData.dueDate || null,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        tags: formData.tags ? formData.tags.filter(tag => tag.trim()) : [], // Remove empty tags
        equipment_id: formData.equipmentId ? parseInt(formData.equipmentId) : null,
        customer_id: formData.customerId ? parseInt(formData.customerId) : null,
      };
      
      console.log('📤 AddTaskForm: Prepared task data for API:', taskData);

      console.log('🚀 AddTaskForm: Submitting task data:', taskData);
      console.log('📋 AddTaskForm: Target task list ID:', preSelectedTaskListId);
      console.log('📎 AddTaskForm: Attachments count:', formData.attachments.length);
      
      // Create the task first
      const response = await apiService.createTask(selectedTaskList.id, taskData);
      
      console.log('✅ AddTaskForm: Task creation response:', response);
      
      console.log('✅ Task created successfully:', response);
      
      // Extract task from response
      let createdTask;
      if (response.data?.task) {
        createdTask = response.data.task;
      } else if (response.task) {
        createdTask = response.task;
      } else if (response.data) {
        createdTask = response.data;
      } else {
        createdTask = response;
      }
      
      if (!createdTask || !createdTask.id) {
        console.error('❌ AddTaskForm: Invalid task response structure:', response);
        throw new Error('Invalid response from server');
      }
      
      // Store the created task ID for comments
      setCreatedTaskId(createdTask.id);
      
      // Handle file attachments if any
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('📎 AddTaskForm: Uploading attachments for task:', createdTask.id);
        
        try {
          const attachmentFormData = new FormData();
          
          // Add attachable info
          attachmentFormData.append('attachable_type', 'App\\Models\\Task');
          attachmentFormData.append('attachable_id', createdTask.id.toString());
          
          // Add files
          formData.attachments.forEach((file, index) => {
            attachmentFormData.append(`files[${index}]`, file);
          });
          
          const attachmentResponse = await apiService.uploadAttachment(attachmentFormData);
          console.log('✅ AddTaskForm: Attachments uploaded successfully:', attachmentResponse);
        } catch (attachmentError) {
          console.error('❌ AddTaskForm: Attachment upload failed:', attachmentError);
          // Don't fail the entire task creation if attachments fail
          alert('Task created successfully, but some attachments failed to upload. You can add them later.');
        }
      }
      
      // Show activity tab to display the created task and allow comments
      setShowActivityTab(true);
      await loadComments(response.data?.task?.id || response.task?.id);
      
      if (response?.data?.task) {
    // Convert API response to frontend Task format
    const createdTask = response.data.task;
    const assignedUser = users.find(user => user.id === createdTask.assigned_to?.id) || createdTask.assigned_to;
    
    const newTask: Task = {
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      priority: createdTask.priority,
      status: selectedTaskList.name,
      assignedTo: assignedUser,
      projectId: selectedProject?.id || createdTask.project_id,
      taskListId: createdTask.task_list_id,
      dueDate: createdTask.due_date,
      startDate: createdTask.start_date,
      createdAt: createdTask.created_at,
      updatedAt: createdTask.updated_at,
      attachments: createdTask.attachments_count || 0,
      comments: createdTask.comments_count || 0,
      taskType: createdTask.task_type,
      tags: createdTask.tags || [],
      estimatedHours: createdTask.estimated_hours || 0
    };
    
    console.log('🎯 AddTaskForm: Converted task for frontend:', newTask);
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    
    // Show success message and redirect
    alert('✅ Task Created Successfully');
    onViewChange(selectedProject ? 'project-detail' : 'dashboard');
    return; // Important: Return here to prevent further execution
  } else {
    throw new Error('Invalid response from server - no task data received');
  }
} catch (error) {
  console.error('❌ AddTaskForm: Task creation failed:', error);
  
  // Show specific error message
  let errorMessage = 'Failed to create task. Please try again.';
  
  if (error.message?.includes('Assigned user must be a member')) {
    errorMessage = 'Error: The assigned user must be a member of the project team.';
  } else if (error.message?.includes('validation')) {
    errorMessage = 'Error: Please check all required fields and try again.';
  } else if (error.message?.includes('mock data')) {
    // Still redirect on mock data success
    onViewChange(selectedProject ? 'project-detail' : 'dashboard');
    return;
  }
  
  setErrors({ general: errorMessage });
      // Don't redirect immediately - let user add comments first
      // onViewChange('project-detail', selectedProject);
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
  //alert(JSON.stringify(selectedProject));
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
                        Equipment Category {loadingEquipment ? '(Loading...)' : '(Optional Filter)'}
                      </label>
                      <select
                        id="equipmentCategory"
                        name="equipmentCategory"
                        value={formData.equipmentCategory}
                        onChange={handleInputChange}
                        disabled={loadingEquipment}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">{loadingEquipment ? 'Loading...' : 'All Categories'}</option>
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
                          disabled={loadingEquipment}
                          className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
                            errors.equipmentId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <span className={formData.equipmentId ? 'text-gray-900' : 'text-gray-500'}>
                            {loadingEquipment ? 'Loading equipment...' :
                             formData.equipmentId 
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
                          disabled={loadingCustomers}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder={loadingCustomers ? "Loading customers..." : "Search customers..."}
                        />
                      </div>
                      
                      {showCustomerDropdown && filteredCustomers.length > 0 && !loadingCustomers && (
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
                      disabled={loadingUsers}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm ${
                        errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{loadingUsers ? 'Loading users...' : 'Select member'}</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="mt-1 text-xs text-red-600">{errors.assignedTo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="sprintId" className="block text-sm font-medium text-gray-700 mb-2">
                      Sprint (Coming Soon)
                    </label>
                    <select
                      id="sprintId"
                      name="sprintId"
                      value={formData.sprintId}
                      onChange={handleInputChange}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    >
                      <option value="">Sprint feature coming soon</option>
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab - Show after task creation */}
          {showActivityTab && createdTaskId && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
                <h2 className="text-lg font-semibold text-gray-900">Task Created Successfully!</h2>
              </div>
              
              <div className="space-y-6">
                {/* Comments Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Comments & Activity</h3>
                  
                  <div className="space-y-4 mb-6">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {comment.user?.avatar || comment.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.user?.name || 'Unknown User'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {comment.formatted_date || new Date(comment.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              {comment.attachments_count > 0 && (
                                <div className="mt-2 text-xs text-blue-600">
                                  📎 {comment.attachments_count} attachment(s)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No comments yet. Add the first comment below.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Comment Form */}
                  <div className="border-t pt-4">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {/* {authContext?.user?.avatar || authContext?.user?.name?.substring(0, 2).toUpperCase() || 'U'} */}
                          U
                        </span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                          rows={3}
                          onDrop={(e) => {
                            e.preventDefault();
                            // Handle file drops for comment attachments
                          }}
                        />
                        <div className="flex justify-end mt-3">
                          {commentLoading ? (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-600">Adding comment...</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Add Comment</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Photos, Videos, and PDFs accepted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {canShowActions && !showActivityTab && (
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

          {/* Final Actions - Show after task creation */}
          {showActivityTab && (
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => onViewChange(selectedProject ? 'project-detail' : 'dashboard')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTaskForm;