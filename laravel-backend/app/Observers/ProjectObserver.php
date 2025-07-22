<?php

namespace App\Observers;

use App\Models\Project;
use App\Models\TaskList;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // Create default task lists when project is created
        $this->createDefaultTaskLists($project);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        //
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        //
    }

    /**
     * Handle the Project "restored" event.
     */
    public function restored(Project $project): void
    {
        //
    }

    /**
     * Handle the Project "force deleted" event.
     */
    public function forceDeleted(Project $project): void
    {
        //
    }

    /**
     * Create default task lists for the project
     */
    private function createDefaultTaskLists(Project $project): void
    {
        $defaultTaskLists = [
            [
                'name' => 'To Do',
                'description' => 'Tasks that are planned but not yet started',
                'color' => 'bg-gray-100',
                'order' => 1
            ],
            [
                'name' => 'In Progress',
                'description' => 'Tasks currently being worked on',
                'color' => 'bg-blue-100',
                'order' => 2
            ],
            [
                'name' => 'Review',
                'description' => 'Tasks completed and awaiting review',
                'color' => 'bg-yellow-100',
                'order' => 3
            ],
            [
                'name' => 'Done',
                'description' => 'Completed and approved tasks',
                'color' => 'bg-green-100',
                'order' => 4
            ]
        ];

        foreach ($defaultTaskLists as $taskListData) {
            TaskList::create([
                'project_id' => $project->id,
                ...$taskListData
            ]);
        }
    }
}