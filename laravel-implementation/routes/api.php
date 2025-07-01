<?php

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskListController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth user
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Task Lists
    Route::get('/projects/{project}/task-lists', [TaskListController::class, 'index']);
    Route::post('/projects/{project}/task-lists', [TaskListController::class, 'store']);
    Route::put('/task-lists/{taskList}', [TaskListController::class, 'update']);
    Route::delete('/task-lists/{taskList}', [TaskListController::class, 'destroy']);
    
    // Tasks
    Route::get('/task-lists/{taskList}/tasks', [TaskController::class, 'index']);
    Route::post('/task-lists/{taskList}/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    Route::post('/tasks/{task}/move', [TaskController::class, 'moveToList']);
    
    // Comments
    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    
    // Attachments
    Route::post('/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);
});