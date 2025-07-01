<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
        'budget',
        'client',
        'objectives',
        'deliverables',
        'tags',
        'settings',
        'created_by',
        'project_manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'objectives' => 'array',
        'deliverables' => 'array',
        'tags' => 'array',
        'settings' => 'array',
        'budget' => 'decimal:2',
    ];

    protected $appends = [
        'tasks_count',
        'completed_tasks',
        'progress_percentage',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function team(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function taskLists(): HasMany
    {
        return $this->hasMany(TaskList::class)->orderBy('order');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // Accessors
    public function getTasksCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    public function getCompletedTasksAttribute(): int
    {
        return $this->tasks()
                    ->whereHas('taskList', function ($query) {
                        $query->where('name', 'Done');
                    })
                    ->count();
    }

    public function getProgressPercentageAttribute(): float
    {
        $total = $this->tasks_count;
        if ($total === 0) return 0;
        
        return round(($this->completed_tasks / $total) * 100, 1);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, User $user)
    {
        return $query->whereHas('team', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });
    }
}