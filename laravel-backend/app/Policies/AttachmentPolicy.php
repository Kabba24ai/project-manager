<?php

namespace App\Policies;

use App\Models\Attachment;
use App\Models\User;

class AttachmentPolicy
{
    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Attachment $attachment): bool
    {
        // User can delete their own attachments
        if ($attachment->uploaded_by === $user->id) {
            return true;
        }

        // Admin can delete any attachment
        if ($user->role === 'admin') {
            return true;
        }

        // Project managers can delete attachments in their projects
        if ($attachment->attachable_type === 'App\Models\Task') {
            $task = $attachment->attachable;
            return $task->project->project_manager_id === $user->id ||
                   $task->project->created_by === $user->id;
        }

        if ($attachment->attachable_type === 'App\Models\Comment') {
            $comment = $attachment->attachable;
            return $comment->task->project->project_manager_id === $user->id ||
                   $comment->task->project->created_by === $user->id;
        }

        return false;
    }
}