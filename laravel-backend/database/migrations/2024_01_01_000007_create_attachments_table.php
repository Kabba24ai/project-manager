<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->morphs('attachable'); // Can attach to tasks or comments
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('mime_type');
            $table->bigInteger('size');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['attachable_type', 'attachable_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('attachments');
    }
};