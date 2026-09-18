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
        Schema::create('paraphrases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chapter_id');
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->text('original_selection');
            $table->text('paraphrased_text')->nullable();
            $table->string('outcome'); // applied | discarded | failed
            $table->timestamps();

            $table->index('chapter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paraphrases');
    }
};
