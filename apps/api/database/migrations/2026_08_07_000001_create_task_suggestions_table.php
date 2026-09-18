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
        Schema::create('task_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thesis_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('priority'); // lower = more urgent
            $table->string('source_type'); // note_revision | chapter_draft
            $table->foreignId('chapter_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supervision_note_id')->nullable()->constrained()->nullOnDelete();
            $table->string('signature', 64); // dedup hash per thesis
            $table->string('status')->default('pending'); // pending | accepted | rejected
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index('thesis_id');
            $table->index(['thesis_id', 'status']);
            $table->unique(['thesis_id', 'signature']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_suggestions');
    }
};