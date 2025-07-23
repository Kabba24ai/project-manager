<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
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
            'task_id' => $this->task_id,
            'content' => $this->content,
            'attachments_count' => $this->attachments_count,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            
            // Computed fields (Laravel 12 features)
            'formatted_date' => $this->created_at?->diffForHumans(),
            'has_attachments' => $this->attachments_count > 0,
        ];
    }
}