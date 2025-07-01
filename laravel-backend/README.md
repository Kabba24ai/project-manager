# Task Master K - Laravel API Backend

## 🏗️ Architecture Overview

This Laravel backend follows **Domain-driven architecture** with **single responsibility controllers**, perfectly matching the React frontend structure.

### 📁 Domain Structure

```
app/Http/Controllers/
├── Auth/                    # Authentication domain
│   ├── LoginController.php
│   ├── LogoutController.php
│   ├── RegisterController.php
│   └── UserController.php
├── Projects/                # Projects domain
│   ├── IndexController.php
│   ├── StoreController.php
│   ├── ShowController.php
│   ├── UpdateController.php
│   └── DeleteController.php
├── TaskLists/              # Task Lists domain
├── Tasks/                  # Tasks domain
├── Comments/               # Comments domain
└── Attachments/            # File attachments domain
```

## 🚀 Installation & Setup

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmaster
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Create storage link for file uploads
php artisan storage:link

# Start development server
php artisan serve
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts with roles
- **projects** - Project management
- **project_user** - Team assignments
- **task_lists** - Customizable task organization
- **tasks** - Task management with multiple types
- **comments** - Task discussions
- **attachments** - File uploads (polymorphic)

### Key Features
- ✅ **Task Types**: General, Equipment ID, Customer Name
- ✅ **File Uploads**: Images, videos, PDFs with size validation
- ✅ **Team Management**: Project roles and permissions
- ✅ **Dynamic Status**: Based on task list names
- ✅ **Comments System**: With media attachments
- ✅ **Priority Sorting**: Urgent → High → Medium → Low

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/user
POST   /api/auth/logout
```

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
```

### Task Lists
```
GET    /api/projects/{project}/task-lists
POST   /api/projects/{project}/task-lists
PUT    /api/task-lists/{id}
DELETE /api/task-lists/{id}
```

### Tasks
```
GET    /api/task-lists/{taskList}/tasks
POST   /api/task-lists/{taskList}/tasks
GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
POST   /api/tasks/{id}/move
```

### Comments & Attachments
```
GET    /api/tasks/{task}/comments
POST   /api/tasks/{task}/comments
POST   /api/attachments
DELETE /api/attachments/{id}
```

## 🔐 Authentication

Uses **Laravel Sanctum** for API token authentication:

```php
// Login response
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "JD",
        "role": "developer"
    },
    "token": "1|abc123...",
    "message": "Login successful"
}
```

## 📝 Task Types

Supports multiple task types matching the frontend:

1. **General** - Standard project tasks
2. **Equipment ID** - Equipment-specific tasks
3. **Customer Name** - Customer-related tasks
4. **Feature** - New feature development
5. **Bug** - Bug fixes
6. **Design** - Design tasks

## 📎 File Attachments

Supports multiple file types:
- **Images**: JPG, PNG, GIF, WebP, BMP, SVG
- **Videos**: MP4, MOV, AVI, WebM, MKV
- **Documents**: PDF, DOC, DOCX, TXT

File validation:
- Maximum size: 100MB per file
- Automatic cleanup on deletion
- Polymorphic attachments (tasks + comments)

## 🎯 Next Steps

1. **Complete remaining controllers** (TaskLists, Tasks, Comments, Attachments)
2. **Add authorization policies** for security
3. **Implement file upload handling**
4. **Add database seeders** for testing
5. **Configure CORS** for frontend integration

The architecture is designed to perfectly match your React frontend structure! 🚀