-- Task Master K - Complete MySQL Database Schema
-- Run these commands in your MySQL database

-- 1. Users Table
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','manager','developer','designer') NOT NULL DEFAULT 'developer',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Projects Table
CREATE TABLE `projects` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('active','planning','completed','on-hold','cancelled') NOT NULL DEFAULT 'active',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `client` varchar(255) DEFAULT NULL,
  `objectives` json DEFAULT NULL,
  `deliverables` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `project_manager_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_status_created_at_index` (`status`,`created_at`),
  KEY `projects_due_date_index` (`due_date`),
  KEY `projects_priority_index` (`priority`),
  KEY `projects_project_manager_id_index` (`project_manager_id`),
  KEY `projects_created_by_index` (`created_by`),
  CONSTRAINT `projects_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `projects_project_manager_id_foreign` FOREIGN KEY (`project_manager_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Project User Pivot Table (Team Assignments)
CREATE TABLE `project_user` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('manager','member','viewer') NOT NULL DEFAULT 'member',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_user_project_id_user_id_unique` (`project_id`,`user_id`),
  KEY `project_user_user_id_foreign` (`user_id`),
  CONSTRAINT `project_user_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Task Lists Table
CREATE TABLE `task_lists` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(50) NOT NULL DEFAULT 'bg-gray-100',
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_lists_project_id_order_index` (`project_id`,`order`),
  CONSTRAINT `task_lists_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tasks Table
CREATE TABLE `tasks` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` bigint(20) UNSIGNED NOT NULL,
  `task_list_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `task_type` enum('general','equipmentId','customerName','feature','bug','design') NOT NULL DEFAULT 'general',
  `assigned_to` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `estimated_hours` int(11) DEFAULT NULL,
  `actual_hours` int(11) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_task_list_id_created_at_index` (`task_list_id`,`created_at`),
  KEY `tasks_assigned_to_due_date_index` (`assigned_to`,`due_date`),
  KEY `tasks_priority_due_date_index` (`priority`,`due_date`),
  KEY `tasks_created_by_foreign` (`created_by`),
  CONSTRAINT `tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `tasks_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_task_list_id_foreign` FOREIGN KEY (`task_list_id`) REFERENCES `task_lists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Comments Table
CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_task_id_created_at_index` (`task_id`,`created_at`),
  KEY `comments_user_id_foreign` (`user_id`),
  CONSTRAINT `comments_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Attachments Table (Polymorphic - can attach to tasks or comments)
CREATE TABLE `attachments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `attachable_type` varchar(255) NOT NULL,
  `attachable_id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `size` bigint(20) NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attachments_attachable_type_attachable_id_index` (`attachable_type`,`attachable_id`),
  KEY `attachments_uploaded_by_foreign` (`uploaded_by`),
  CONSTRAINT `attachments_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Personal Access Tokens Table (for Laravel Sanctum authentication)
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data Insertion
-- Insert sample users
INSERT INTO `users` (`name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
('Admin User', 'admin@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW()),
('Sarah Johnson', 'sarah.johnson@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', NOW(), NOW()),
('Mike Chen', 'mike.chen@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'developer', NOW(), NOW()),
('Emily Rodriguez', 'emily.rodriguez@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'designer', NOW(), NOW()),
('David Kim', 'david.kim@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'developer', NOW(), NOW()),
('Lisa Wang', 'lisa.wang@taskmaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'developer', NOW(), NOW());

-- Insert sample project
INSERT INTO `projects` (`name`, `description`, `status`, `priority`, `start_date`, `due_date`, `budget`, `client`, `objectives`, `deliverables`, `tags`, `settings`, `created_by`, `project_manager_id`, `created_at`, `updated_at`) VALUES
('E-commerce Platform Redesign', 'Complete overhaul of the existing e-commerce platform with modern UI/UX principles and improved performance.', 'active', 'high', '2024-01-15', '2024-04-30', 75000.00, 'TechCorp Solutions', 
'["Improve user experience and conversion rates by 25%", "Implement modern responsive design for all devices", "Optimize performance and reduce loading times by 40%"]',
'["New responsive website design and implementation", "Mobile-optimized user interface with PWA features", "Performance optimization report and implementation"]',
'["web", "ecommerce", "redesign", "ui/ux", "performance"]',
'{"taskTypes": {"general": true, "equipmentId": false, "customerName": true}, "allowFileUploads": true, "requireApproval": true, "enableTimeTracking": true, "publicProject": false}',
1, 2, NOW(), NOW());

-- Insert team assignments for the project
INSERT INTO `project_user` (`project_id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
(1, 2, 'manager', NOW(), NOW()),
(1, 3, 'member', NOW(), NOW()),
(1, 4, 'member', NOW(), NOW()),
(1, 5, 'member', NOW(), NOW());

-- Insert default task lists for the project
INSERT INTO `task_lists` (`project_id`, `name`, `description`, `color`, `order`, `created_at`, `updated_at`) VALUES
(1, 'To Do', 'Tasks that are planned but not yet started', 'bg-gray-100', 1, NOW(), NOW()),
(1, 'In Progress', 'Tasks currently being worked on', 'bg-blue-100', 2, NOW(), NOW()),
(1, 'Review', 'Tasks completed and awaiting review', 'bg-yellow-100', 3, NOW(), NOW()),
(1, 'Done', 'Completed and approved tasks', 'bg-green-100', 4, NOW(), NOW());

-- Insert sample tasks
INSERT INTO `tasks` (`project_id`, `task_list_id`, `title`, `description`, `priority`, `task_type`, `assigned_to`, `created_by`, `start_date`, `due_date`, `estimated_hours`, `tags`, `created_at`, `updated_at`) VALUES
(1, 2, 'Create wireframes for homepage', 'Design wireframes for the new homepage layout including hero section, navigation, and footer components.', 'high', 'design', 4, 1, '2024-01-20', '2024-01-30', 16, '["wireframes", "homepage", "design"]', NOW(), NOW()),
(1, 1, 'Implement user authentication system', 'Develop secure user login, registration, and password reset functionality with OAuth integration.', 'urgent', 'feature', 3, 1, '2024-02-01', '2024-02-15', 32, '["authentication", "security", "backend"]', NOW(), NOW()),
(1, 3, 'Product catalog page optimization', 'Optimize product listing page for better performance and user experience with advanced filtering.', 'medium', 'general', 5, 1, '2024-01-25', '2024-02-10', 24, '["optimization", "catalog", "performance"]', NOW(), NOW());

-- Note: Password for all sample users is 'password' (hashed with bcrypt)
-- You can login with any of the sample users using their email and 'password'