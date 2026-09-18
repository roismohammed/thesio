<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the guidance_points table. Points are always accessed through
     * their parent guide (route nesting + the guide's ownership scope).
     */
    public function up(): void
    {
        Schema::create('guidance_points', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('supervision_guide_id')->constrained()->cascadeOnDelete();
            $table->string('origin', 20); // system | student
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('pending'); // pending | prepared
            $table->integer('priority')->default(999); // lower = more urgent
            $table->foreignId('chapter_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supervision_note_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('supervision_guide_id');
            $table->index(['supervision_guide_id', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guidance_points');
    }
};
