<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskListResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'order' => $this->order,
            'tasks_count' => $this->tasks_count,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Relationships
            'tasks' => TaskResource::collection($this->whenLoaded('tasks')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            
            // Computed fields (Laravel 12 features)
            'is_empty' => $this->tasks_count === 0,
            'color_preview' => $this->getColorPreview(),
            'formatted_name' => ucwords($this->name),
            'can_be_deleted' => $this->tasks_count === 0,
            'completion_percentage' => $this->getCompletionPercentage(),
        ];
    }

    /**
     * Get color preview information (Laravel 12 match expression).
     */
    private function getColorPreview(): array
    {
        return match($this->color) {
            'bg-blue-100' => ['name' => 'Blue', 'hex' => '#dbeafe'],
            'bg-green-100' => ['name' => 'Green', 'hex' => '#dcfce7'],
            'bg-yellow-100' => ['name' => 'Yellow', 'hex' => '#fef3c7'],
            'bg-red-100' => ['name' => 'Red', 'hex' => '#fee2e2'],
            'bg-purple-100' => ['name' => 'Purple', 'hex' => '#f3e8ff'],
            'bg-indigo-100' => ['name' => 'Indigo', 'hex' => '#e0e7ff'],
            'bg-pink-100' => ['name' => 'Pink', 'hex' => '#fce7f3'],
            'bg-gray-100' => ['name' => 'Gray', 'hex' => '#f3f4f6'],
            default => ['name' => 'Default', 'hex' => '#f3f4f6']
        };
    }

    /**
     * Calculate completion percentage for this task list (Laravel 12 feature)
     */
    private function getCompletionPercentage(): float
    {
        if (!$this->relationLoaded('tasks') || $this->tasks->isEmpty()) {
            return 0.0;
        }

        $completedTasks = $this->tasks->filter(function ($task) {
            return $task->taskList && $task->taskList->name === 'Done';
        })->count();

        return round(($completedTasks / $this->tasks->count()) * 100, 1);
    }
}