import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Upload, X, Calendar, Users, Flag, Settings, Plus, Minus } from 'lucide-react';
import { ViewType } from '../types';

interface AddProjectFormProps {
  onViewChange: (view: ViewType, data?: any) => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onViewChange }) => {
  // Mock users data - this would come from API
  const [availableUsers] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'Project Manager', avatar: 'SJ', email: 'sarah.johnson@company.com' },
    { id: 2, name: 'Mike Chen', role: 'Senior Developer', avatar: 'MC', email: 'mike.chen@company.com' },
    { id: 3, name: 'Emily Rodriguez', role: 'UI/UX Designer', avatar: 'ER', email: 'emily.rodriguez@company.com' },
    { id: 4, name: 'David Kim', role: 'Full Stack Developer', avatar: 'DK', email: 'david.kim@company.com' },
    { id: 5, name: 'Lisa Wang', role: 'QA Engineer', avatar: 'LW', email: 'lisa.wang@company.com' },
    { id: 6, name: 'John Smith', role: 'DevOps Engineer', avatar: 'JS', email: 'john.smith@company.com' },
    { id: 7, name: 'Anna Thompson', role: 'Business Analyst', avatar: 'AT', email: 'anna.thompson@company.com' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    status: 'Active',
    startDate: '',
    dueDate: '',
    budget: '',
    client: '',
    teamMembers: [],
    projectManager: '',
    tags: [],
    objectives: [''],
    deliverables: [''],
    attachments: [],
    settings: {
      taskTypes: {
        general: true,
        equipmentId: false,
        customerName: false
      },
      allowFileUploads: true,
      requireApproval: false,
      enableTimeTracking: true,
      publicProject: false
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSettingsChange = (settingPath, value) => {
    const [parent, child] = settingPath.split('.');
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [parent]: {
          ...prev.settings[parent],
          [child]: value
        }
      }
    }));
  };

  const handleTeamMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId]
    }));
  };

  const handleProjectManagerSelect = (userId) => {
    setFormData(prev => ({
      ...prev,
      projectManager: userId,
      teamMembers: prev.teamMembers.includes(userId) 
        ? prev.teamMembers 
        : [...prev.teamMembers, userId]
    }));
    setShowManagerDropdown(false);
  };

  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Project name is required';
      if (!formData.description.trim()) newErrors.description = 'Project description is required';
      // Due date validation only if both dates are provided
      if (formData.startDate && formData.dueDate && new Date(formData.startDate) >= new Date(formData.dueDate)) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }
    
    if (step === 2) {
      if (!formData.projectManager) newErrors.projectManager = 'Project manager is required';
      if (formData.teamMembers.length === 0) newErrors.teamMembers = 'At least one team member is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect back to dashboard
      onViewChange('dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onViewChange('dashboard');
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
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
  };

  const getFileTypeColor = (file) => {
    const fileType = file.type.toLowerCase();
    if (fileType.startsWith('image/')) return 'bg-green-100 text-green-600';
    if (fileType.startsWith('video/')) return 'bg-purple-100 text-purple-600';
    if (fileType === 'application/pdf') return 'bg-red-100 text-red-600';
    if (fileType.includes('word')) return 'bg-blue-100 text-blue-600';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'bg-emerald-100 text-emerald-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getSelectedUsers = () => {
    return availableUsers.filter(user => formData.teamMembers.includes(user.id));
  };

  const getProjectManager = () => {
    return availableUsers.find(user => user.id === formData.projectManager);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step === currentStep 
              ? 'bg-blue-600 text-white' 
              : step < currentStep 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? '✓' : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 transition-colors ${
              step < currentStep ? 'bg-green-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

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
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Details</h2>
                <p className="text-gray-600">Let's start with the basic information about your project</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
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
                    placeholder="Enter project name"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
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
                    placeholder="Describe the project goals, scope, and key deliverables"
                  />
                  {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Active">Active</option>
                      <option value="Planning">Planning</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (Optional)
                    </label>
                    <input
                      type="text"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="$50,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                    Client/Stakeholder (Optional)
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Client or stakeholder name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Assignment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Assignment</h2>
                <p className="text-gray-600">Select the project manager and team members</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Manager *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowManagerDropdown(!showManagerDropdown)}
                      className={`w-full px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
                        errors.projectManager ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <span className={formData.projectManager ? 'text-gray-900' : 'text-gray-500'}>
                        {getProjectManager()?.name || 'Select project manager'}
                      </span>
                      <Users className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {showManagerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {availableUsers.map(user => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleProjectManagerSelect(user.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">{user.avatar}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.role}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.projectManager && <p className="mt-2 text-sm text-red-600">{errors.projectManager}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members *
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                      {availableUsers.map(user => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={formData.teamMembers.includes(user.id)}
                            onChange={() => handleTeamMemberToggle(user.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">{user.avatar}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.role} • {user.email}</div>
                          </div>
                          {formData.projectManager === user.id && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Manager</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {errors.teamMembers && <p className="mt-2 text-sm text-red-600">{errors.teamMembers}</p>}
                  
                  {formData.teamMembers.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Team ({formData.teamMembers.length} members)</h4>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedUsers().map(user => (
                          <div key={user.id} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-blue-200">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">{user.avatar}</span>
                            </div>
                            <span className="text-sm text-gray-900">{user.name}</span>
                            {formData.projectManager === user.id && (
                              <span className="text-xs text-blue-600">(PM)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Project Planning */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Planning</h2>
                <p className="text-gray-600">Define objectives, deliverables, and project tags</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Objectives
                  </label>
                  <div className="space-y-3">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => handleArrayFieldChange('objectives', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={`Objective ${index + 1}`}
                        />
                        {formData.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('objectives', index)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('objectives')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Objective</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Deliverables
                  </label>
                  <div className="space-y-3">
                    {formData.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={deliverable}
                          onChange={(e) => handleArrayFieldChange('deliverables', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder={`Deliverable ${index + 1}`}
                        />
                        {formData.deliverables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('deliverables', index)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField('deliverables')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Deliverable</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Tags
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Add tags (e.g., web, mobile, design)"
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
              </div>
            </div>
          )}

          {/* Step 4: Settings & Attachments */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Settings</h2>
                <p className="text-gray-600">Configure project settings and add any initial documents</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Task Configuration</h3>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">General Tasks</label>
                        <p className="text-xs text-gray-500">Standard project tasks with manual entry</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.taskTypes.general}
                        onChange={(e) => handleSettingsChange('taskTypes.general', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Equipment ID Tasks</label>
                        <p className="text-xs text-gray-500">Tasks linked to specific equipment items</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.taskTypes.equipmentId}
                        onChange={(e) => handleSettingsChange('taskTypes.equipmentId', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Customer Tasks</label>
                        <p className="text-xs text-gray-500">Tasks associated with specific customers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.taskTypes.customerName}
                        onChange={(e) => handleSettingsChange('taskTypes.customerName', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Features</h3>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">File Uploads</label>
                        <p className="text-xs text-gray-500">Allow team members to upload files to tasks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.allowFileUploads}
                        onChange={(e) => handleSettingsChange('allowFileUploads', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Task Approval Required</label>
                        <p className="text-xs text-gray-500">Require manager approval for task completion</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.requireApproval}
                        onChange={(e) => handleSettingsChange('requireApproval', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Time Tracking</label>
                        <p className="text-xs text-gray-500">Enable time tracking for tasks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.enableTimeTracking}
                        onChange={(e) => handleSettingsChange('enableTimeTracking', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Public Project</label>
                        <p className="text-xs text-gray-500">Make project visible to all organization members</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.settings.publicProject}
                        onChange={(e) => handleSettingsChange('publicProject', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Documents</h3>
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
                        Add project documents, specifications, or reference materials
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
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
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectForm;