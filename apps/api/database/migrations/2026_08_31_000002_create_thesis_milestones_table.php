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
        Schema::create('thesis_milestones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('thesis_id');
            $table->string('name'); // e.g. "Proposal / Sempro", "Pengambilan Data", "Seminar Hasil (Semhas)", "Sidang Skripsi"
            $table->date('target_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->string('status')->default('pending'); // pending, in_progress, completed
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();

            $table->index('thesis_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thesis_milestones');
    }
};
