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
                'description' => 'Complete overhaul of the existing e-commerce platform with modern UI/UX principles and improved performance. This project aims to increase conversion rates and improve user experience across all devices.',
                'status' => 'active',
                'priority' => 'high',
                'start_date' => '2024-01-15',
                'due_date' => '2024-04-30',
                'budget' => 75000.00,
                'client' => 'TechCorp Solutions',
                'objectives' => [
                    'Improve user experience and conversion rates by 25%',
                    'Implement modern responsive design for all devices',
                    'Optimize performance and reduce loading times by 40%',
                    'Add advanced search and filtering capabilities',
                    'Integrate with new payment gateway systems'
                ],
                'deliverables' => [
                    'New responsive website design and implementation',
                    'Mobile-optimized user interface with PWA features',
                    'Performance optimization report and implementation',
                    'User testing documentation and results',
                    'SEO optimization and analytics setup'
                ],
                'tags' => ['web', 'ecommerce', 'redesign', 'ui/ux', 'performance'],
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
                'description' => 'Native iOS and Android application for customer engagement and service management. The app will provide real-time notifications, offline capabilities, and seamless integration with existing systems.',
                'status' => 'active',
                'priority' => 'medium',
                'start_date' => '2024-02-01',
                'due_date' => '2024-06-15',
                'budget' => 120000.00,
                'client' => 'ServicePro Inc',
                'objectives' => [
                    'Develop cross-platform mobile application using React Native',
                    'Integrate with existing backend systems and APIs',
                    'Implement push notifications and real-time updates',
                    'Create intuitive user interface following platform guidelines',
                    'Ensure offline functionality for critical features'
                ],
                'deliverables' => [
                    'iOS application published to App Store',
                    'Android application published to Google Play Store',
                    'API integration documentation and testing',
                    'User manual and training materials',
                    'App store optimization and marketing assets'
                ],
                'tags' => ['mobile', 'ios', 'android', 'react-native', 'api'],
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
                'name' => 'Digital Marketing Campaign Q2',
                'description' => 'Comprehensive Q2 digital marketing initiatives and brand awareness campaigns across multiple channels including social media, email marketing, and content creation.',
                'status' => 'completed',
                'priority' => 'medium',
                'start_date' => '2024-01-01',
                'due_date' => '2024-03-31',
                'budget' => 45000.00,
                'client' => 'BrandMax Marketing',
                'objectives' => [
                    'Increase brand awareness by 40% across target demographics',
                    'Generate 500 qualified leads through digital channels',
                    'Improve social media engagement rates by 60%',
                    'Launch successful email marketing campaigns',
                    'Create viral content that reaches 1M+ impressions'
                ],
                'deliverables' => [
                    'Social media content calendar for Q2',
                    'Email marketing templates and automation',
                    'Campaign performance reports and analytics',
                    'Brand guidelines documentation update',
                    'Influencer partnership agreements and content'
                ],
                'tags' => ['marketing', 'social-media', 'email', 'branding', 'content'],
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
            ],
            [
                'name' => 'Data Analytics Dashboard',
                'description' => 'Internal dashboard for business intelligence and data visualization. This project will create a comprehensive analytics platform for real-time business insights and reporting.',
                'status' => 'planning',
                'priority' => 'low',
                'start_date' => '2024-03-01',
                'due_date' => '2024-07-30',
                'budget' => 85000.00,
                'client' => 'Internal - Operations Team',
                'objectives' => [
                    'Create real-time business intelligence dashboard',
                    'Integrate data from multiple sources and systems',
                    'Implement advanced data visualization and reporting',
                    'Provide self-service analytics capabilities',
                    'Ensure data security and compliance standards'
                ],
                'deliverables' => [
                    'Interactive business intelligence dashboard',
                    'Data integration and ETL pipeline setup',
                    'Custom reporting tools and templates',
                    'User training and documentation',
                    'Data governance and security implementation'
                ],
                'tags' => ['analytics', 'dashboard', 'data', 'visualization', 'bi'],
                'settings' => [
                    'taskTypes' => [
                        'general' => true,
                        'equipmentId' => false,
                        'customerName' => false
                    ],
                    'allowFileUploads' => true,
                    'requireApproval' => true,
                    'enableTimeTracking' => true,
                    'publicProject' => false
                ],
                'created_by' => $admin->id,
                'project_manager_id' => $david->id,
                'team' => [$david->id, $lisa->id, $mike->id]
            ]
        ];

        foreach ($projects as $projectData) {
            $team = $projectData['team'];
            unset($projectData['team']);

            $project = Project::create($projectData);

            // Attach team members with appropriate roles
            $teamMembers = [];
            foreach ($team as $userId) {
                $role = ($userId === $project->project_manager_id) ? 'manager' : 'member';
                $teamMembers[$userId] = ['role' => $role];
            }
            
            $project->team()->sync($teamMembers);
        }
    }
}