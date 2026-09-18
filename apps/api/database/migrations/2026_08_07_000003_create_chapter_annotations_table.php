<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chapter_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('version_id')->nullable()->constrained('chapter_versions')->nullOnDelete();
            $table->text('selected_text');
            $table->string('color', 30)->default('yellow'); // yellow, green, blue, pink, orange
            $table->text('comment')->nullable();
            $table->string('author_name')->nullable();
            $table->string('author_role', 50)->default('student'); // student, lecturer, general
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_annotations');
    }
};
