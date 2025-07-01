<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'task_type' => 'sometimes|in:general,equipmentId,customerName,feature,bug,design',
            'assigned_to' => 'sometimes|required|exists:users,id',
            'task_list_id' => 'sometimes|required|exists:task_lists,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_hours' => 'nullable|integer|min:0',
            'actual_hours' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'feedback' => 'nullable|string',
            'equipment_id' => 'nullable|integer',
            'customer_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date must be after or equal to start date.',
            'assigned_to.exists' => 'The selected user does not exist.',
            'task_list_id.exists' => 'The selected task list does not exist.',
        ];
    }
}