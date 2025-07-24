<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->enum('status', ['active', 'inactive', 'prospect'])->default('active');
            $table->text('notes')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('website')->nullable();
            $table->timestamps();
            
            $table->index(['status']);
            $table->index(['name']);
            $table->index(['company']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};