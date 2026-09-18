<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the defense deadline and guidance read-tracking columns to theses.
     */
    public function up(): void
    {
        Schema::table('theses', function (Blueprint $table): void {
            $table->timestamp('defense_deadline_at')->nullable();
            $table->timestamp('guidance_last_viewed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('theses', function (Blueprint $table): void {
            $table->dropColumn(['defense_deadline_at', 'guidance_last_viewed_at']);
        });
    }
};
