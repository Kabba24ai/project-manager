<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Relationships
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'task_list' => new TaskListResource($this->whenLoaded('taskList')),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),

            // Additional computed fields (Laravel 12 features)
            'is_overdue' => $this->due_date?->isPast() && $this->status !== 'Done',
            'days_until_due' => $this->due_date ? now()->diffInDays($this->due_date, false) : null,
            'formatted_priority' => ucfirst($this->priority),
            'formatted_task_type' => $this->getFormattedTaskType(),
            'progress_status' => $this->getProgressStatus(),
        ];
    }

    /**
     * Get formatted task type for display (Laravel 12 match expression)
     */
    private function getFormattedTaskType(): string
    {
        return match($this->task_type) {
            'equipmentId' => 'Equipment ID',
            'customerName' => 'Customer',
            'taskType' => 'Task Type',
            default => ucfirst($this->task_type)
        };
    }

    /**
     * Get progress status based on task list and dates (Laravel 12 feature)
     */
    private function getProgressStatus(): string
    {
        if ($this->status === 'Done') {
            return 'completed';
        }

        if ($this->due_date && $this->due_date->isPast()) {
            return 'overdue';
        }

        if ($this->status === 'In Progress') {
            return 'in_progress';
        }

        return 'pending';
    }
}