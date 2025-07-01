<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        return $project->team()->where('user_id', $user->id)->exists() ||
               $project->created_by === $user->id ||
               $project->project_manager_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->created_by === $user->id ||
               $project->project_manager_id === $user->id ||
               $user->role === 'admin' ||
               $project->team()->where('user_id', $user->id)->wherePivot('role', 'manager')->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->created_by === $user->id ||
               $user->role === 'admin';
    }
}