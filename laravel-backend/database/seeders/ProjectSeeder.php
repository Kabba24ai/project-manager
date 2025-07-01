<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@taskmaster.com')->first();
        $sarah = User::where('email', 'sarah.johnson@taskmaster.com')->first();
        $mike = User::where('email', 'mike.chen@taskmaster.com')->first();
        $emily = User::where('email', 'emily.rodriguez@taskmaster.com')->first();
        $david = User::where('email', 'david.kim@taskmaster.com')->first();
        $lisa = User::where('email', 'lisa.wang@taskmaster.com')->first();

        $projects = [
            [
                'name' => 'E-commerce Platform Redesign',
                'description' => 'Complete overhaul of the existing e-commerce platform with modern UI/UX principles and improved performance.',
                'status' => 'active',
                'priority' => 'high',
                'start_date' => '2024-01-15',
                'due_date' => '2024-04-30',
                'budget' => 75000.00,
                'client' => 'TechCorp Solutions',
                'objectives' => [
                    'Improve user experience and conversion rates',
                    'Implement modern responsive design',
                    'Optimize performance and loading times',
                    'Add advanced search and filtering capabilities'
                ],
                'deliverables' => [
                    'New responsive website design',
                    'Mobile-optimized user interface',
                    'Performance optimization report',
                    'User testing documentation'
                ],
                'tags' => ['web', 'ecommerce', 'redesign', 'ui/ux'],
                'settings' => [
                    'taskTypes' => [
                        'general' => true,
                        'equipmentId' => false,
                        'customerName' => true
                    ],
                    'allowFileUploads' => true,
                    'requireApproval' => true,
                    'enableTimeTracking' => true,
                    'publicProject' => false
                ],
                'created_by' => $admin->id,
                'project_manager_id' => $sarah->id,
                'team' => [$sarah->id, $mike->id, $emily->id, $david->id]
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Native iOS and Android application for customer engagement and service management.',
                'status' => 'active',
                'priority' => 'medium',
                'start_date' => '2024-02-01',
                'due_date' => '2024-06-15',
                'budget' => 120000.00,
                'client' => 'ServicePro Inc',
                'objectives' => [
                    'Develop cross-platform mobile application',
                    'Integrate with existing backend systems',
                    'Implement push notifications',
                    'Create intuitive user interface'
                ],
                'deliverables' => [
                    'iOS application',
                    'Android application',
                    'API integration documentation',
                    'User manual and training materials'
                ],
                'tags' => ['mobile', 'ios', 'android', 'api'],
                'settings' => [
                    'taskTypes' => [
                        'general' => true,
                        'equipmentId' => true,
                        'customerName' => true
                    ],
                    'allowFileUploads' => true,
                    'requireApproval' => false,
                    'enableTimeTracking' => true,
                    'publicProject' => false
                ],
                'created_by' => $admin->id,
                'project_manager_id' => $mike->id,
                'team' => [$mike->id, $david->id, $lisa->id]
            ],
            [
                'name' => 'Digital Marketing Campaign',
                'description' => 'Q2 digital marketing initiatives and brand awareness campaigns across multiple channels.',
                'status' => 'completed',
                'priority' => 'medium',
                'start_date' => '2024-01-01',
                'due_date' => '2024-03-31',
                'budget' => 45000.00,
                'client' => 'BrandMax Marketing',
                'objectives' => [
                    'Increase brand awareness by 40%',
                    'Generate 500 qualified leads',
                    'Improve social media engagement',
                    'Launch email marketing campaigns'
                ],
                'deliverables' => [
                    'Social media content calendar',
                    'Email marketing templates',
                    'Campaign performance reports',
                    'Brand guidelines documentation'
                ],
                'tags' => ['marketing', 'social-media', 'email', 'branding'],
                'settings' => [
                    'taskTypes' => [
                        'general' => true,
                        'equipmentId' => false,
                        'customerName' => true
                    ],
                    'allowFileUploads' => true,
                    'requireApproval' => true,
                    'enableTimeTracking' => false,
                    'publicProject' => true
                ],
                'created_by' => $admin->id,
                'project_manager_id' => $sarah->id,
                'team' => [$sarah->id, $emily->id]
            ]
        ];

        foreach ($projects as $projectData) {
            $team = $projectData['team'];
            unset($projectData['team']);

            $project = Project::create($projectData);

            // Attach team members
            $teamMembers = [];
            foreach ($team as $userId) {
                $role = $userId === $project->project_manager_id ? 'manager' : 'member';
                $teamMembers[$userId] = ['role' => $role];
            }
            
            $project->team()->sync($teamMembers);
        }
    }
}