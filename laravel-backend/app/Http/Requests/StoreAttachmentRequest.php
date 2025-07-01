<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'files' => 'required|array|max:10',
            'files.*' => [
                'required',
                'file',
                'max:102400', // 100MB in KB
                'mimes:jpg,jpeg,png,gif,webp,bmp,svg,mp4,mov,avi,webm,mkv,pdf,doc,docx,txt'
            ],
            'attachable_type' => 'required|string|in:App\Models\Task,App\Models\Comment',
            'attachable_id' => 'required|integer|exists_with_type',
        ];
    }

    public function messages(): array
    {
        return [
            'files.*.max' => 'Each file must not exceed 100MB.',
            'files.*.mimes' => 'File type not supported. Allowed: Images, Videos, PDFs, Documents.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->addExtension('exists_with_type', function ($attribute, $value, $parameters, $validator) {
            $type = $this->input('attachable_type');
            
            if ($type === 'App\Models\Task') {
                return \App\Models\Task::where('id', $value)->exists();
            }
            
            if ($type === 'App\Models\Comment') {
                return \App\Models\Comment::where('id', $value)->exists();
            }
            
            return false;
        });

        $validator->addReplacer('exists_with_type', function ($message, $attribute, $rule, $parameters) {
            return 'The selected attachable item does not exist.';
        });
    }
}