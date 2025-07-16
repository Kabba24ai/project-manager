<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    public function rules(): array
    {
        return [
            // Step 1: Basic Information
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:active,planning,on-hold',
            'start_date' => 'nullable|date|after_or_equal:today',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0|max:999999999.99',
            'client' => 'nullable|string|max:255',

            // Step 2: Team Assignment
            'project_manager_id' => 'required|exists:users,id',
            'team_members' => 'required|array|min:1',
            'team_members.*' => 'exists:users,id',

            // Step 3: Project Planning
            'objectives' => 'nullable|array',
            'objectives.*' => 'string|max:1000',
            'deliverables' => 'nullable|array',
            'deliverables.*' => 'string|max:1000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',

            // Step 4: Settings & Configuration
            'settings' => 'nullable|array',
            'settings.taskTypes' => 'nullable|array',
            'settings.taskTypes.general' => 'boolean',
            'settings.taskTypes.equipmentId' => 'boolean',
            'settings.taskTypes.customerName' => 'boolean',
            'settings.allowFileUploads' => 'boolean',
            'settings.requireApproval' => 'boolean',
            'settings.enableTimeTracking' => 'boolean',
            'settings.publicProject' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Project name is required.',
            'name.max' => 'Project name cannot exceed 255 characters.',
            'description.required' => 'Project description is required.',
            'description.max' => 'Project description cannot exceed 5000 characters.',
            'due_date.after_or_equal' => 'Due date must be after or equal to start date.',
            'start_date.after_or_equal' => 'Start date cannot be in the past.',
            'budget.numeric' => 'Budget must be a valid number.',
            'budget.min' => 'Budget cannot be negative.',
            'project_manager_id.required' => 'Project manager is required.',
            'project_manager_id.exists' => 'Selected project manager does not exist.',
            'team_members.required' => 'At least one team member is required.',
            'team_members.min' => 'At least one team member must be selected.',
            'team_members.*.exists' => 'One or more selected team members do not exist.',
            'objectives.*.max' => 'Each objective cannot exceed 1000 characters.',
            'deliverables.*.max' => 'Each deliverable cannot exceed 1000 characters.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
        ];
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation()
    {
        // Ensure project manager is included in team members
        if ($this->has('project_manager_id') && $this->has('team_members')) {
            $teamMembers = $this->team_members ?? [];
            if (!in_array($this->project_manager_id, $teamMembers)) {
                $teamMembers[] = $this->project_manager_id;
                $this->merge(['team_members' => $teamMembers]);
            }
        }

        // Set default settings if not provided
        if (!$this->has('settings')) {
            $this->merge([
                'settings' => [
                    'taskTypes' => [
                        'general' => true,
                        'equipmentId' => false,
                        'customerName' => false
                    ],
                    'allowFileUploads' => true,
                    'requireApproval' => false,
                    'enableTimeTracking' => true,
                    'publicProject' => false
                ]
            ]);
        }

        // Clean up empty arrays
        if ($this->has('objectives')) {
            $this->merge([
                'objectives' => array_filter($this->objectives, function($item) {
                    return !empty(trim($item));
                })
            ]);
        }

        if ($this->has('deliverables')) {
            $this->merge([
                'deliverables' => array_filter($this->deliverables, function($item) {
                    return !empty(trim($item));
                })
            ]);
        }

        if ($this->has('tags')) {
            $this->merge([
                'tags' => array_filter($this->tags, function($item) {
                    return !empty(trim($item));
                })
            ]);
        }
    }
}