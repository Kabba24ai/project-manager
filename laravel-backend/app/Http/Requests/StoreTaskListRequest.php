<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class StoreTaskListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request (Laravel 12 compatible).
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => ['sometimes', 'string', 'max:50', 'regex:/^bg-\w+-\d+$/'],
            'order' => 'sometimes|integer|min:0',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Task list name is required.',
            'name.max' => 'Task list name cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'color.regex' => 'Color must be a valid Tailwind CSS background class (e.g., bg-blue-100).',
            'order.integer' => 'Order must be a valid integer.',
            'order.min' => 'Order cannot be negative.',
        ];
    }

    /**
     * Prepare the data for validation (Laravel 12 compatible).
     */
    protected function prepareForValidation(): void
    {
        // Set default color if not provided
        if (!$this->has('color') || empty($this->color)) {
            $this->merge([
                'color' => 'bg-blue-100'
            ]);
        }

        // Clean up description
        if ($this->has('description')) {
            $this->merge([
                'description' => trim($this->description) ?: null
            ]);
        }

        // Ensure name is trimmed
        if ($this->has('name')) {
            $this->merge([
                'name' => trim($this->name)
            ]);
        }
    }

    /**
     * Get validated data with defaults (Laravel 12 feature).
     */
    public function validatedWithDefaults(): array
    {
        $validated = $this->validated();
        
        return array_merge([
            'color' => 'bg-blue-100',
            'description' => null,
        ], $validated);
    }
}