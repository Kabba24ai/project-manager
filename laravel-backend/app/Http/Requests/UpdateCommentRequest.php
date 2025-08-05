<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class UpdateCommentRequest extends FormRequest
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
            'content' => 'sometimes|required|string|min:1|max:10000',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Comment content is required.',
            'content.min' => 'Comment must not be empty.',
            'content.max' => 'Comment cannot exceed 10,000 characters.',
        ];
    }

    /**
     * Prepare the data for validation (Laravel 12 compatible).
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from content if provided
        if ($this->has('content')) {
            $this->merge([
                'content' => trim($this->content)
            ]);
        }
    }
}