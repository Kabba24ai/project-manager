<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'task_type' => 'sometimes|in:general,equipmentId,customerName,feature,bug,design',
            'assigned_to' => 'required|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'estimated_hours' => 'nullable|integer|min:0',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'equipment_id' => 'nullable|integer',
            'customer_id' => 'nullable|integer',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => [
                'file',
                'max:102400', // 100MB in KB
                'mimes:jpg,jpeg,png,gif,webp,bmp,svg,mp4,mov,avi,webm,mkv,pdf,doc,docx,txt'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'due_date.after_or_equal' => 'Due date must be after or equal to start date.',
            'assigned_to.exists' => 'The selected user does not exist.',
            'attachments.max' => 'Maximum 10 files allowed.',
            'attachments.*.max' => 'Each file must not exceed 100MB.',
            'attachments.*.mimes' => 'File type not supported. Allowed: Images, Videos, PDFs, Documents.',
        ];
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation()
    {
        // Set default values if not provided
        $this->merge([
            'priority' => $this->priority ?? 'medium',
            'task_type' => $this->task_type ?? 'general',
            'tags' => $this->tags ?? [],
        ]);

        // Clean up tags array
        if ($this->has('tags') && is_array($this->tags)) {
            $this->merge([
                'tags' => array_filter($this->tags, function($tag) {
                    return !empty(trim($tag));
                })
            ]);
        }
    }
}