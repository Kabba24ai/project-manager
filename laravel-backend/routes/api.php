<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Domain: Authentication
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\UserController;

// Domain: Projects
use App\Http\Controllers\Projects\IndexController as ProjectIndexController;
use App\Http\Controllers\Projects\StoreController as ProjectStoreController;
use App\Http\Controllers\Projects\ShowController as ProjectShowController;
use App\Http\Controllers\Projects\UpdateController as ProjectUpdateController;
use App\Http\Controllers\Projects\DeleteController as ProjectDeleteController;

// Domain: TaskLists
use App\Http\Controllers\TaskLists\IndexController as TaskListIndexController;
use App\Http\Controllers\TaskLists\StoreController as TaskListStoreController;
use App\Http\Controllers\TaskLists\UpdateController as TaskListUpdateController;
use App\Http\Controllers\TaskLists\DeleteController as TaskListDeleteController;

// Domain: Tasks
use App\Http\Controllers\Tasks\IndexController as TaskIndexController;
use App\Http\Controllers\Tasks\StoreController as TaskStoreController;
use App\Http\Controllers\Tasks\ShowController as TaskShowController;
use App\Http\Controllers\Tasks\UpdateController as TaskUpdateController;
use App\Http\Controllers\Tasks\DeleteController as TaskDeleteController;
use App\Http\Controllers\Tasks\MoveController as TaskMoveController;

// Domain: Comments
use App\Http\Controllers\Comments\IndexController as CommentIndexController;
use App\Http\Controllers\Comments\StoreController as CommentStoreController;
use App\Http\Controllers\Comments\UpdateController as CommentUpdateController;
use App\Http\Controllers\Comments\DeleteController as CommentDeleteController;

// Domain: Attachments
use App\Http\Controllers\Attachments\StoreController as AttachmentStoreController;
use App\Http\Controllers\Attachments\DeleteController as AttachmentDeleteController;

// Users Controller
use App\Http\Controllers\UsersController;

/*
|--------------------------------------------------------------------------
| API Routes - Laravel 12 with Domain Driven Architecture
|--------------------------------------------------------------------------
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'laravel_version' => app()->version(),
    ]);
});

// Public test endpoint for development
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working',
        'timestamp' => now()->toISOString(),
    ]);
});

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', LoginController::class);
    Route::post('/register', RegisterController::class);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', UserController::class);
        Route::post('/logout', LogoutController::class);
    });
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Users Routes (for team selection)
    Route::prefix('users')->group(function () {
        Route::get('/', [UsersController::class, 'index']);
        Route::get('/managers', [UsersController::class, 'managers']);
    });
    
    // Projects Domain
    Route::prefix('projects')->group(function () {
        Route::get('/', ProjectIndexController::class);
        Route::post('/', ProjectStoreController::class);
        Route::get('/{project}', ProjectShowController::class);
        Route::put('/{project}', ProjectUpdateController::class);
        Route::delete('/{project}', ProjectDeleteController::class);
    });
    
    // Task Lists Domain
    Route::prefix('projects/{project}/task-lists')->group(function () {
        Route::get('/', TaskListIndexController::class);
        Route::post('/', TaskListStoreController::class);
    });
    
    Route::prefix('task-lists')->group(function () {
        Route::put('/{taskList}', TaskListUpdateController::class);
        Route::delete('/{taskList}', TaskListDeleteController::class);
    });
    
    // Tasks Domain
    Route::prefix('task-lists/{taskList}/tasks')->group(function () {
        Route::get('/', TaskIndexController::class);
        Route::post('/', TaskStoreController::class);
        Route::post('/with-attachments', TaskStoreController::class . '@storeWithAttachments');
    });
    
    Route::prefix('tasks')->group(function () {
        Route::get('/{task}', TaskShowController::class);
        Route::put('/{task}', TaskUpdateController::class);
        Route::delete('/{task}', TaskDeleteController::class);
        Route::post('/{task}/move', TaskMoveController::class);
    });
    
    // Comments Domain
    Route::prefix('tasks/{task}/comments')->group(function () {
        Route::get('/', CommentIndexController::class);
        Route::post('/', CommentStoreController::class);
    });
    
    Route::prefix('comments')->group(function () {
        Route::put('/{comment}', CommentUpdateController::class);
        Route::delete('/{comment}', CommentDeleteController::class);
    });
    
    // Attachments Domain
    Route::prefix('attachments')->group(function () {
        Route::post('/', AttachmentStoreController::class);
        Route::delete('/{attachment}', AttachmentDeleteController::class);
    });
    
    // Equipment Routes (for task assignment)
    Route::prefix('equipment')->group(function () {
        Route::get('/', [EquipmentController::class, 'index']);
        Route::get('/{id}', [EquipmentController::class, 'show']);
    });
    
    // Customer Routes (for task assignment)
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::get('/{id}', [CustomerController::class, 'show']);
    });
});

// CORS preflight handling
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
})->where('any', '.*');