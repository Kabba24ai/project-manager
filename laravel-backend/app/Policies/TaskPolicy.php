<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view tasks they have access to
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        // User can view task if they have access to the project
        return $task->project->canUserAccess($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create tasks in projects they have access to
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Task assignee, project manager, or admin can update
        return $task->assigned_to === $user->id ||
               $task->created_by === $user->id ||
               $task->project->project_manager_id === $user->id ||
               $task->project->created_by === $user->id ||
               $user->role === 'admin' ||
               $task->project->team()->where('user_id', $user->id)->wherePivot('role', 'manager')->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Task creator, project manager, or admin can delete
        return $task->created_by === $user->id ||
               $task->project->project_manager_id === $user->id ||
               $task->project->created_by === $user->id ||
               $user->role === 'admin';
    }

    /**
     * Determine whether the user can assign the task to others.
     */
    public function assign(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }

    /**
     * Determine whether the user can move task between lists.
     */
    public function move(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }
}