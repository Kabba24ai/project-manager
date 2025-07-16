<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('status', ['active', 'planning', 'completed', 'on-hold', 'cancelled'])->default('active');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('budget', 12, 2)->nullable();
            $table->string('client')->nullable();
            $table->json('objectives')->nullable();
            $table->json('deliverables')->nullable();
            $table->json('tags')->nullable();
            $table->json('settings')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('project_manager_id')->constrained('users');
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index(['due_date']);
            $table->index(['priority']);
            $table->index(['project_manager_id']);
            $table->index(['created_by']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};