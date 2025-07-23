<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Relationships
            'team' => UserResource::collection($this->whenLoaded('team')),
            'project_manager' => new UserResource($this->whenLoaded('projectManager')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'task_lists' => $this->whenLoaded('taskLists', function() {
                return TaskListResource::collection($this->taskLists)->values();
            }, []),
            
            // Computed fields (Laravel 12 features)
            'is_overdue' => $this->due_date && $this->due_date->isPast() && $this->status !== 'completed',
            'days_until_due' => $this->due_date ? now()->diffInDays($this->due_date, false) : null,
            'formatted_status' => ucwords(str_replace('-', ' ', $this->status)),
            'formatted_priority' => ucfirst($this->priority),
            'team_count' => $this->whenLoaded('team', fn() => $this->team->count(), 0),
            'can_user_edit' => $this->canUserEdit($request->user()),
        ];
    }

    /**
     * Check if current user can edit this project (Laravel 12 helper method)
     */
    private function canUserEdit($user): bool
    {
        if (!$user) return false;
        
        return $this->created_by === $user->id ||
               $this->project_manager_id === $user->id ||
               $user->role === 'admin' ||
               $this->team->where('id', $user->id)->where('pivot.role', 'manager')->isNotEmpty();
    }
}