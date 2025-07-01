<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Database\Seeder;

class TaskListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::all();

        $taskListTemplates = [
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

        foreach ($projects as $project) {
            foreach ($taskListTemplates as $template) {
                TaskList::create([
                    'project_id' => $project->id,
                    ...$template
                ]);
            }
        }
    }
}