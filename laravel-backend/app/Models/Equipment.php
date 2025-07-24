<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'name',
        'code',
        'serial_number',
        'type',
        'status',
        'description',
        'location',
        'purchase_date',
        'warranty_expiry',
        'maintenance_schedule',
        'specifications',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'specifications' => 'array',
    ];

    // Relationships
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'equipment_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}