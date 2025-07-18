# Task Master K - Project Management Application

A modern project management application built with React (frontend) and Laravel (backend).

## Features

- **Project Management**: Create, edit, and manage projects with team assignments
- **Task Organization**: Flexible task lists and kanban-style task management
- **Team Collaboration**: User management with role-based permissions
- **File Attachments**: Support for images, videos, and documents
- **Real-time Comments**: Task-level discussions with media support
- **Progress Tracking**: Visual progress indicators and reporting

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Laravel 10** with PHP 8.1+
- **Laravel Sanctum** for API authentication
- **MySQL** database
- **Domain-driven architecture** with single responsibility controllers

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PHP 8.1+ and Composer
- MySQL 8.0+

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to Laravel backend:
```bash
cd laravel-backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskmaster
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations and seeders:
```bash
php artisan migrate --seed
```

7. Create storage link:
```bash
php artisan storage:link
```

8. Start development server:
```bash
php artisan serve
```

## API Integration

The React frontend communicates with the Laravel backend through a RESTful API:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Users
- `GET /api/users` - List users (with filtering)
- `GET /api/users/managers` - List project managers

### Task Lists & Tasks
- `GET /api/projects/{project}/task-lists` - Get project task lists
- `POST /api/projects/{project}/task-lists` - Create task list
- `POST /api/task-lists/{taskList}/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/move` - Move task between lists

## Project Structure

### Frontend (`/src`)
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Mock data (for development)
```

### Backend (`/laravel-backend`)
```
app/
├── Http/
│   ├── Controllers/    # Domain-driven controllers
│   ├── Requests/       # Form request validation
│   ├── Resources/      # API resource transformers
│   └── Middleware/     # Custom middleware
├── Models/             # Eloquent models
└── Policies/           # Authorization policies
```

## Development Workflow

1. **Create New Features**: Start with the Laravel API endpoints, then build the React components
2. **Testing**: Use the provided seeders to populate test data
3. **API Documentation**: Refer to `laravel-backend/API_TESTING.md` for endpoint details

## Authentication Flow

1. User logs in through React frontend
2. Laravel returns JWT token via Sanctum
3. Token stored in localStorage and sent with API requests
4. Backend validates token for protected routes

## File Uploads

The application supports file uploads for:
- Project documents during creation
- Task attachments
- Comment attachments

Supported formats: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, WebM), Documents (PDF, DOC, TXT)

## Contributing

1. Follow the established patterns for both frontend and backend
2. Use TypeScript for type safety in React components
3. Follow Laravel conventions for API development
4. Test API endpoints using the provided examples

## License

This project is open source and available under the MIT License.