# Project Creation API Testing Guide

## Authentication Required
All endpoints require authentication using Laravel Sanctum. Include the token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## 1. Get Available Users for Team Selection

### Get All Users
```http
GET /api/users
```

### Get Users by Role
```http
GET /api/users?role=developer
GET /api/users?role=manager
```

### Search Users
```http
GET /api/users?search=john
```

### Get Project Managers Only
```http
GET /api/users/managers
```

## 2. Create New Project

### Endpoint
```http
POST /api/projects
Content-Type: application/json
```

### Request Body Example (Minimum Required)
```json
{
    "name": "New E-commerce Project",
    "description": "Building a modern e-commerce platform with React and Laravel",
    "project_manager_id": 2,
    "team_members": [2, 3, 4]
}
```

### Request Body Example (Complete)
```json
{
    "name": "Advanced Project Management System",
    "description": "A comprehensive project management system with task tracking, team collaboration, and reporting features. This system will help teams organize their work more effectively.",
    "priority": "high",
    "status": "active",
    "start_date": "2024-02-01",
    "due_date": "2024-08-31",
    "budget": 150000.00,
    "client": "Tech Innovations Inc",
    "project_manager_id": 2,
    "team_members": [2, 3, 4, 5, 6],
    "objectives": [
        "Develop a scalable project management platform",
        "Implement real-time collaboration features",
        "Create comprehensive reporting and analytics",
        "Ensure mobile responsiveness and accessibility"
    ],
    "deliverables": [
        "Web application with full functionality",
        "Mobile-responsive design",
        "API documentation",
        "User training materials",
        "Deployment and maintenance guide"
    ],
    "tags": ["web", "project-management", "collaboration", "react", "laravel"],
    "settings": {
        "taskTypes": {
            "general": true,
            "equipmentId": true,
            "customerName": true
        },
        "allowFileUploads": true,
        "requireApproval": true,
        "enableTimeTracking": true,
        "publicProject": false
    }
}
```

### Success Response (201 Created)
```json
{
    "project": {
        "id": 5,
        "name": "Advanced Project Management System",
        "description": "A comprehensive project management system...",
        "status": "active",
        "priority": "high",
        "start_date": "2024-02-01",
        "due_date": "2024-08-31",
        "budget": "150000.00",
        "client": "Tech Innovations Inc",
        "objectives": [...],
        "deliverables": [...],
        "tags": [...],
        "settings": {...},
        "tasks_count": 0,
        "completed_tasks": 0,
        "progress_percentage": 0,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "team": [
            {
                "id": 2,
                "name": "Sarah Johnson",
                "email": "sarah.johnson@taskmaster.com",
                "avatar": "SJ",
                "role": "manager",
                "pivot": {
                    "role": "manager"
                }
            },
            {
                "id": 3,
                "name": "Mike Chen",
                "email": "mike.chen@taskmaster.com",
                "avatar": "MC",
                "role": "developer",
                "pivot": {
                    "role": "member"
                }
            }
        ],
        "project_manager": {
            "id": 2,
            "name": "Sarah Johnson",
            "email": "sarah.johnson@taskmaster.com",
            "avatar": "SJ",
            "role": "manager"
        },
        "task_lists": [
            {
                "id": 17,
                "name": "To Do",
                "description": "Tasks that are planned but not yet started",
                "color": "bg-gray-100",
                "order": 1,
                "tasks_count": 0
            },
            {
                "id": 18,
                "name": "In Progress",
                "description": "Tasks currently being worked on",
                "color": "bg-blue-100",
                "order": 2,
                "tasks_count": 0
            },
            {
                "id": 19,
                "name": "Review",
                "description": "Tasks completed and awaiting review",
                "color": "bg-yellow-100",
                "order": 3,
                "tasks_count": 0
            },
            {
                "id": 20,
                "name": "Done",
                "description": "Completed and approved tasks",
                "color": "bg-green-100",
                "order": 4,
                "tasks_count": 0
            }
        ],
        "is_overdue": false,
        "days_until_due": 198
    },
    "message": "Project created successfully"
}
```

### Error Response Examples

#### Validation Error (422 Unprocessable Entity)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["Project name is required."],
        "description": ["Project description is required."],
        "project_manager_id": ["Project manager is required."],
        "team_members": ["At least one team member is required."]
    }
}
```

#### Authorization Error (403 Forbidden)
```json
{
    "message": "This action is unauthorized."
}
```

## 3. Get Projects List

### Endpoint
```http
GET /api/projects
```

### Optional Query Parameters
```http
GET /api/projects?status=active
GET /api/projects?status=completed
```

## 4. Get Single Project

### Endpoint
```http
GET /api/projects/{id}
```

### Response includes full project details with team, task lists, and tasks

## 5. Update Project

### Endpoint
```http
PUT /api/projects/{id}
Content-Type: application/json
```

### Request body can include any of the fields from creation

## 6. Delete Project

### Endpoint
```http
DELETE /api/projects/{id}
```

### Success Response (200 OK)
```json
{
    "message": "Project deleted successfully"
}
```

## Testing with cURL

### Create Project Example
```bash
curl -X POST http://your-domain.com/api/projects \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "This is a test project",
    "project_manager_id": 2,
    "team_members": [2, 3, 4]
  }'
```

### Get Users Example
```bash
curl -X GET http://your-domain.com/api/users \
  -H "Authorization: Bearer your-token-here"
```

## Notes

1. **Default Task Lists**: When a project is created, 4 default task lists are automatically created: "To Do", "In Progress", "Review", and "Done".

2. **Team Management**: The project manager is automatically added to the team members list if not already included.

3. **Authorization**: Only users with 'admin' or 'manager' roles can create projects.

4. **Settings**: If settings are not provided, default settings are applied automatically.

5. **Validation**: All fields are validated according to the rules defined in `StoreProjectRequest`.