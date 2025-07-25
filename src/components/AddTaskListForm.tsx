import React, { useState } from 'react';
import { ArrowLeft, Save, List } from 'lucide-react';
import { ViewType, TaskList } from '../types';
import apiService from '../services/api';

interface AddTaskListFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
  selectedProject?: any;
  onTaskListCreated: (taskList: TaskList) => void;
}

const AddTaskListForm: React.FC<AddTaskListFormProps> = ({ 
  onViewChange, 
  selectedProject, 
  onTaskListCreated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-100'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    { value: 'bg-blue-100', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-green-100', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-yellow-100', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-red-100', label: 'Red', preview: 'bg-red-100' },
    { value: 'bg-purple-100', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-indigo-100', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-pink-100', label: 'Pink', preview: 'bg-pink-100' },
    { value: 'bg-gray-100', label: 'Gray', preview: 'bg-gray-100' }
  ];

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task list name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task list description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('🚀 AddTaskListForm: Starting task list creation...');
      console.log('📋 AddTaskListForm: Form data:', formData);
      console.log('🏗️ AddTaskListForm: Selected project:', selectedProject);
      
      if (!selectedProject?.id) {
        throw new Error('No project selected');
      }
      
      // Prepare task list data for API
      const taskListData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color
      };
      
      console.log('📤 AddTaskListForm: Sending to API:', taskListData);
      
      // Call Laravel API to create task list
      const response = await apiService.createTaskList(selectedProject.id, taskListData);
      
      console.log('✅ AddTaskListForm: Task list created successfully:', response);
      
      // Convert API response to TaskList format
      const newTaskList: TaskList = {
        id: response.data.task_list.id,
        name: response.data.task_list.name,
        description: response.data.task_list.description,
        color: response.data.task_list.color,
        order: response.data.task_list.order,
        projectId: response.data.task_list.project_id,
        tasks: [],
        createdAt: response.data.task_list.created_at,
        updatedAt: response.data.task_list.updated_at
      };
      
      // Update global state
      onTaskListCreated(newTaskList);
      
      // Success - redirect back to project view
      onViewChange('project-detail', selectedProject);
    } catch (error) {
      console.error('❌ AddTaskListForm: Error creating task list:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('Backend unavailable')) {
        alert('Backend server is not running. Please start Laravel backend with "php artisan serve"');
      } else if (error.message?.includes('validation')) {
        alert('Validation error: Please check your input and try again.');
      } else {
        alert(`Failed to create task list: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onViewChange('project-detail', selectedProject);
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
            <h1 className="text-2xl font-bold text-gray-900">Add Task List</h1>
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
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Task List</h2>
            <p className="text-gray-600">Organize your project tasks with custom task lists</p>
          </div>

          <div className="space-y-6">
            {/* Task List Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Task List Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., To Do, In Progress, Review, Done"
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Task List Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Brief description of what tasks belong in this list"
              />
              {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.color === color.value 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${color.preview} mb-2`}></div>
                    <span className="text-xs font-medium text-gray-700">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className={`px-4 py-3 rounded-t-lg border-b border-gray-200 ${formData.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formData.name || 'Task List Name'}
                      </h4>
                      {formData.description && (
                        <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                      )}
                    </div>
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                      0 tasks
                    </span>
                  </div>
                </div>
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tasks will appear here
                </div>
              </div>
            </div>
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
                  <span>Create Task List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskListForm;