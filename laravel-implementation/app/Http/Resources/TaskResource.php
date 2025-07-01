<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'task_list_id' => $this->task_list_id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status, // From task list name
            'task_type' => $this->task_type,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'estimated_hours' => $this->estimated_hours,
            'actual_hours' => $this->actual_hours,
            'tags' => $this->tags ?? [],
            'feedback' => $this->feedback,
            'equipment_id' => $this->equipment_id,
            'customer_id' => $this->customer_id,
            'attachments_count' => $this->attachments_count,
            'comments_count' => $this->comments_count,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'task_list' => new TaskListResource($this->whenLoaded('taskList')),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}