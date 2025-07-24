<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    /**
     * Transform the resource into an array (Laravel 12 compatible).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'serial_number' => $this->serial_number,
            'type' => $this->type,
            'status' => $this->status,
            'description' => $this->description,
            'location' => $this->location,
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'warranty_expiry' => $this->warranty_expiry?->format('Y-m-d'),
            'maintenance_schedule' => $this->maintenance_schedule,
            'specifications' => $this->specifications ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Computed fields (Laravel 12 features)
            'is_active' => $this->status === 'active',
            'is_under_warranty' => $this->warranty_expiry && $this->warranty_expiry->isFuture(),
            'formatted_type' => ucwords(str_replace('_', ' ', $this->type)),
            'display_name' => $this->code ? "{$this->name} ({$this->code})" : $this->name,
            'tasks_count' => $this->whenLoaded('tasks', fn() => $this->tasks->count(), 0),
        ];
    }
}