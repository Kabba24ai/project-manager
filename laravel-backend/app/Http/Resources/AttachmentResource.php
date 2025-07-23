<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
{
    /**
     * Transform the resource into an array (Laravel 12 compatible).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'formatted_size' => $this->formatted_size,
            'url' => $this->url,
            'created_at' => $this->created_at?->toISOString(),
            
            // Relationships
            'uploader' => new UserResource($this->whenLoaded('uploader')),
            
            // Computed fields (Laravel 12 features)
            'file_type' => $this->getFileType(),
            'is_image' => $this->isImage(),
            'is_video' => $this->isVideo(),
            'is_document' => $this->isDocument(),
        ];
    }

    /**
     * Get file type category (Laravel 12 helper method)
     */
    private function getFileType(): string
    {
        return match(true) {
            str_starts_with($this->mime_type, 'image/') => 'image',
            str_starts_with($this->mime_type, 'video/') => 'video',
            str_starts_with($this->mime_type, 'application/pdf') => 'pdf',
            str_contains($this->mime_type, 'document') => 'document',
            default => 'file'
        };
    }

    /**
     * Check if file is an image (Laravel 12 helper method)
     */
    private function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if file is a video (Laravel 12 helper method)
     */
    private function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Check if file is a document (Laravel 12 helper method)
     */
    private function isDocument(): bool
    {
        return str_contains($this->mime_type, 'document') || 
               str_contains($this->mime_type, 'pdf') ||
               str_contains($this->mime_type, 'text');
    }
}