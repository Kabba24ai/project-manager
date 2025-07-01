<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'task_list_id',
        'title',
        'description',
        'priority',
        'task_type',
        'assigned_to',
        'created_by',
        'start_date',
        'due_date',
        'estimated_hours',
        'actual_hours',
        'tags',
        'feedback',
        'equipment_id',
        'customer_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'tags' => 'array',
    ];

    protected $appends = [
        'status',
        'attachments_count',
        'comments_count',
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function taskList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // Accessors
    public function getStatusAttribute(): string
    {
        return $this->taskList->name ?? 'Unknown';
    }

    public function getAttachmentsCountAttribute(): int
    {
        return $this->attachments()->count();
    }

    public function getCommentsCountAttribute(): int
    {
        return $this->comments()->count();
    }

    // Scopes
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->whereHas('taskList', function ($q) {
                        $q->where('name', '!=', 'Done');
                    });
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }
}