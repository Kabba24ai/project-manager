<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskList extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'color',
        'order',
    ];

    protected $appends = [
        'tasks_count',
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderByRaw("
            CASE priority 
                WHEN 'urgent' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                WHEN 'low' THEN 4 
                ELSE 5 
            END, title ASC
        ");
    }

    // Accessors
    public function getTasksCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    // Boot method for auto-ordering
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($taskList) {
            if (is_null($taskList->order)) {
                $taskList->order = static::where('project_id', $taskList->project_id)->max('order') + 1;
            }
        });
    }
}