<?php

namespace App\Policies;

use App\Models\TaskList;
use App\Models\User;

class TaskListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view task lists they have access to
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TaskList $taskList): bool
    {
        // User can view task list if they have access to the project
        return $taskList->project->canUserAccess($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create task lists in projects they have access to
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaskList $taskList): bool
    {
        // Project manager, creator, or admin can update task lists
        return $taskList->project->project_manager_id === $user->id ||
               $taskList->project->created_by === $user->id ||
               $user->role === 'admin' ||
               $taskList->project->team()->where('user_id', $user->id)->wherePivot('role', 'manager')->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaskList $taskList): bool
    {
        // Only project manager, creator, or admin can delete task lists
        // And only if the task list is empty
        return ($taskList->project->project_manager_id === $user->id ||
                $taskList->project->created_by === $user->id ||
                $user->role === 'admin') &&
               $taskList->tasks()->count() === 0;
    }

    /**
     * Determine whether the user can reorder task lists.
     */
    public function reorder(User $user, TaskList $taskList): bool
    {
        return $this->update($user, $taskList);
    }
}