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
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
                'role' => $this->user->role,
            ],
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            
            // Computed fields (Laravel 12 features)
            'formatted_date' => $this->created_at?->diffForHumans(),
            'has_attachments' => $this->attachments_count > 0,
            'is_recent' => $this->created_at?->isAfter(now()->subHours(24)) ?? false,
            'can_edit' => $this->canUserEdit($request->user()),
            'can_delete' => $this->canUserDelete($request->user()),
        ];
    }

    /**
     * Check if current user can edit this comment (Laravel 12 helper method)
     */
    private function canUserEdit($user): bool
    {
        if (!$user) return false;
        
        return $this->user_id === $user->id || $user->role === 'admin';
    }

    /**
     * Check if current user can delete this comment (Laravel 12 helper method)
     */
    private function canUserDelete($user): bool
    {
        if (!$user) return false;
        
        return $this->user_id === $user->id ||
               $user->role === 'admin' ||
               $this->task->project->created_by === $user->id ||
               $this->task->project->project_manager_id === $user->id;
    }
}