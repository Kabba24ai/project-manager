<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view projects they have access to
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        return $project->canUserAccess($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and managers can create projects
        return in_array($user->role, ['admin', 'manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        // Project creator, project manager, or admin can update
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
        // Only project creator or admin can delete
        return $project->created_by === $user->id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can manage team members.
     */
    public function manageTeam(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }

    /**
     * Determine whether the user can view project settings.
     */
    public function viewSettings(User $user, Project $project): bool
    {
        return $this->update($user, $project);
    }
}