# Laravel Backend Implementation - Task Master K

## Project Structure Following Design Rules

This Laravel implementation follows the established coding structure and design patterns from the React frontend.

## Installation & Setup

```bash
# Create Laravel project
composer create-project laravel/laravel task-master-api
cd task-master-api

# Install required packages
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require intervention/image

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate
php artisan db:seed
```

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

### Projects
- GET /api/projects
- POST /api/projects
- GET /api/projects/{id}
- PUT /api/projects/{id}
- DELETE /api/projects/{id}

### Task Lists
- GET /api/projects/{project}/task-lists
- POST /api/projects/{project}/task-lists
- PUT /api/task-lists/{id}
- DELETE /api/task-lists/{id}

### Tasks
- GET /api/task-lists/{taskList}/tasks
- POST /api/task-lists/{taskList}/tasks
- GET /api/tasks/{id}
- PUT /api/tasks/{id}
- DELETE /api/tasks/{id}

### Comments & Attachments
- GET /api/tasks/{task}/comments
- POST /api/tasks/{task}/comments
- POST /api/attachments
- DELETE /api/attachments/{id}