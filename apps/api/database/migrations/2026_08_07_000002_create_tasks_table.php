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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thesis_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('todo'); // todo | doing | done
            $table->integer('priority')->default(999); // lower = more urgent
            $table->integer('position')->default(999); // card order within column
            $table->timestamp('due_at')->nullable();
            $table->string('due_at_mode')->default('auto'); // auto | manual
            $table->string('origin')->default('manual'); // manual | suggestion
            $table->foreignId('chapter_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supervision_note_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('task_suggestion_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('thesis_id');
            $table->index(['thesis_id', 'status', 'position']);
            $table->index(['thesis_id', 'due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};