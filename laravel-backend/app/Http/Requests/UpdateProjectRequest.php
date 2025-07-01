<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'status' => 'sometimes|in:active,completed,on-hold,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'client' => 'nullable|string|max:255',
            'objectives' => 'nullable|array',
            'objectives.*' => 'string',
            'deliverables' => 'nullable|array',
            'deliverables.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'settings' => 'nullable|array',
            'project_manager_id' => 'nullable|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date must be after or equal to start date.',
            'team_members.*.exists' => 'One or more selected team members do not exist.',
        ];
    }
}