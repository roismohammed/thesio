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
        Schema::table('paraphrases', function (Blueprint $table) {
            $table->foreignId('supervision_note_id')
                ->nullable()
                ->after('user_id')
                ->constrained('supervision_notes')
                ->nullOnDelete();
            $table->text('custom_instruction')->nullable()->after('original_selection');
            $table->text('reference_context')->nullable()->after('custom_instruction');
            $table->string('style_mode')->default('academic')->after('reference_context');
            $table->timestamp('applied_at')->nullable()->after('outcome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('paraphrases', function (Blueprint $table) {
            $table->dropForeign(['supervision_note_id']);
            $table->dropColumn([
                'supervision_note_id',
                'custom_instruction',
                'reference_context',
                'style_mode',
                'applied_at',
            ]);
        });
    }
};
