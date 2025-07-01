<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('task_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color', 50)->default('bg-gray-100');
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['project_id', 'order']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_lists');
    }
};