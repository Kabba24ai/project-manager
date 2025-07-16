<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'budget' => $this->budget,
            'client' => $this->client,
            'objectives' => $this->objectives ?? [],
            'deliverables' => $this->deliverables ?? [],
            'tags' => $this->tags ?? [],
            'settings' => $this->settings ?? [
                'taskTypes' => [
                    'general' => true,
                    'equipmentId' => false,
                    'customerName' => false
                ],
                'allowFileUploads' => true,
                'requireApproval' => false,
                'enableTimeTracking' => true,
                'publicProject' => false
            ],
            'tasks_count' => $this->tasks_count,
            'completed_tasks' => $this->completed_tasks,
            'progress_percentage' => $this->progress_percentage,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'team' => UserResource::collection($this->whenLoaded('team')),
            'project_manager' => new UserResource($this->whenLoaded('projectManager')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'task_lists' => TaskListResource::collection($this->whenLoaded('taskLists')),
            
            // Computed fields
            'is_overdue' => $this->due_date && $this->due_date->isPast() && $this->status !== 'completed',
            'days_until_due' => $this->due_date ? now()->diffInDays($this->due_date, false) : null,
        ];
    }
}