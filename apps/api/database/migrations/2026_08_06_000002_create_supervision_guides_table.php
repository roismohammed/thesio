<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the supervision_guides table. At most one status='current'
     * guide per thesis is maintained by the service (archive-then-create
     * inside a transaction).
     */
    public function up(): void
    {
        Schema::create('supervision_guides', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('thesis_id')->constrained()->cascadeOnDelete();
            $table->string('origin', 20); // scheduled | on_demand
            $table->string('status', 20)->default('current'); // current | archived
            $table->boolean('is_tailored')->default(false);
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['thesis_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervision_guides');
    }
};
