<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::with('taskLists')->get();
        $users = User::all();

        foreach ($projects as $project) {
            $todoList = $project->taskLists->where('name', 'To Do')->first();
            $inProgressList = $project->taskLists->where('name', 'In Progress')->first();
            $reviewList = $project->taskLists->where('name', 'Review')->first();
            $doneList = $project->taskLists->where('name', 'Done')->first();

            if ($project->name === 'E-commerce Platform Redesign') {
                $tasks = [
                    [
                        'title' => 'Create wireframes for homepage',
                        'description' => 'Design wireframes for the new homepage layout including hero section, navigation, and footer components.',
                        'priority' => 'high',
                        'task_type' => 'design',
                        'task_list_id' => $inProgressList->id,
                        'assigned_to' => $users->where('role', 'designer')->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-01-20',
                        'due_date' => '2024-01-30',
                        'estimated_hours' => 16,
                        'tags' => ['wireframes', 'homepage', 'design']
                    ],
                    [
                        'title' => 'Implement user authentication system',
                        'description' => 'Develop secure user login, registration, and password reset functionality with OAuth integration.',
                        'priority' => 'urgent',
                        'task_type' => 'feature',
                        'task_list_id' => $todoList->id,
                        'assigned_to' => $users->where('role', 'developer')->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-02-01',
                        'due_date' => '2024-02-15',
                        'estimated_hours' => 32,
                        'tags' => ['authentication', 'security', 'backend']
                    ],
                    [
                        'title' => 'Product catalog page optimization',
                        'description' => 'Optimize product listing page for better performance and user experience with advanced filtering.',
                        'priority' => 'medium',
                        'task_type' => 'general',
                        'task_list_id' => $reviewList->id,
                        'assigned_to' => $users->where('role', 'developer')->skip(1)->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-01-25',
                        'due_date' => '2024-02-10',
                        'estimated_hours' => 24,
                        'actual_hours' => 20,
                        'tags' => ['optimization', 'catalog', 'performance']
                    ]
                ];
            } elseif ($project->name === 'Mobile App Development') {
                $tasks = [
                    [
                        'title' => 'Setup React Native project structure',
                        'description' => 'Initialize React Native project with proper folder structure, navigation, and state management.',
                        'priority' => 'high',
                        'task_type' => 'general',
                        'task_list_id' => $doneList->id,
                        'assigned_to' => $users->where('role', 'developer')->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-02-01',
                        'due_date' => '2024-02-05',
                        'estimated_hours' => 12,
                        'actual_hours' => 10,
                        'tags' => ['react-native', 'setup', 'architecture']
                    ],
                    [
                        'title' => 'Design mobile UI components',
                        'description' => 'Create reusable UI components for mobile app following design system guidelines.',
                        'priority' => 'medium',
                        'task_type' => 'design',
                        'task_list_id' => $inProgressList->id,
                        'assigned_to' => $users->where('role', 'designer')->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-02-06',
                        'due_date' => '2024-02-20',
                        'estimated_hours' => 28,
                        'tags' => ['ui', 'components', 'mobile']
                    ]
                ];
            } else {
                $tasks = [
                    [
                        'title' => 'Social media content creation',
                        'description' => 'Create engaging social media content for Facebook, Instagram, and LinkedIn campaigns.',
                        'priority' => 'medium',
                        'task_type' => 'general',
                        'task_list_id' => $doneList->id,
                        'assigned_to' => $users->where('role', 'designer')->first()->id,
                        'created_by' => $project->created_by,
                        'start_date' => '2024-01-01',
                        'due_date' => '2024-01-15',
                        'estimated_hours' => 20,
                        'actual_hours' => 18,
                        'tags' => ['social-media', 'content', 'marketing']
                    ]
                ];
            }

            foreach ($tasks as $taskData) {
                Task::create([
                    'project_id' => $project->id,
                    ...$taskData
                ]);
            }
        }
    }
}