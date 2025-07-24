<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->string('serial_number')->unique()->nullable();
            $table->enum('type', ['machinery', 'vehicle', 'tool', 'computer', 'furniture', 'other'])->default('other');
            $table->enum('status', ['active', 'maintenance', 'retired', 'damaged'])->default('active');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->string('maintenance_schedule')->nullable();
            $table->json('specifications')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'type']);
            $table->index(['name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};