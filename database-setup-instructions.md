# Database Setup Instructions for Task Master K

## Prerequisites
- MySQL 8.0 or higher
- PHP 8.1 or higher
- Composer installed

## Step 1: Create Database
```sql
CREATE DATABASE taskmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Create Database User (Optional but Recommended)
```sql
CREATE USER 'taskmaster_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON taskmaster.* TO 'taskmaster_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 3: Run the Schema
1. Copy the contents of `database-schema.sql`
2. Connect to your MySQL database:
   ```bash
   mysql -u root -p taskmaster
   ```
3. Paste and execute the SQL commands

## Step 4: Configure Laravel Environment
Update your Laravel `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmaster
DB_USERNAME=taskmaster_user
DB_PASSWORD=your_secure_password
```

## Step 5: Test the Connection
```bash
cd laravel-backend
php artisan migrate:status
```

## Sample Login Credentials
After running the schema, you can login with:
- **Email**: admin@taskmaster.com
- **Password**: password
- **Role**: Admin

Or any of these users:
- sarah.johnson@taskmaster.com (Manager)
- mike.chen@taskmaster.com (Developer)
- emily.rodriguez@taskmaster.com (Designer)
- david.kim@taskmaster.com (Developer)
- lisa.wang@taskmaster.com (Developer)

All passwords are: `password`

## Table Relationships Overview

```
users (1) ←→ (many) projects [created_by, project_manager_id]
users (many) ←→ (many) projects [project_user pivot table]
projects (1) ←→ (many) task_lists
task_lists (1) ←→ (many) tasks
users (1) ←→ (many) tasks [assigned_to, created_by]
tasks (1) ←→ (many) comments
users (1) ←→ (many) comments
tasks/comments (1) ←→ (many) attachments [polymorphic]
users (1) ←→ (many) personal_access_tokens [authentication]
```

## Key Features Supported
- ✅ User management with roles (admin, manager, developer, designer)
- ✅ Project creation with team assignments
- ✅ Task lists with custom colors and ordering
- ✅ Tasks with priorities, types, and assignments
- ✅ Comments system with user attribution
- ✅ File attachments (polymorphic - can attach to tasks or comments)
- ✅ Authentication tokens for API access
- ✅ Proper foreign key constraints and cascading deletes
- ✅ JSON fields for flexible data storage (objectives, deliverables, tags, settings)
- ✅ Indexes for optimal query performance

## Storage Requirements
- Estimated size for 1000 projects with full data: ~50-100MB
- File attachments stored separately in Laravel storage
- JSON fields allow flexible schema evolution