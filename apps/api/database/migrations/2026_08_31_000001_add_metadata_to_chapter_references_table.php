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
        Schema::table('chapter_references', function (Blueprint $table) {
            $table->string('authors')->nullable()->after('title');
            $table->string('year', 10)->nullable()->after('authors');
            $table->string('publication')->nullable()->after('year'); // Journal / Book / Publisher
            $table->string('volume')->nullable()->after('publication');
            $table->string('pages')->nullable()->after('volume');
            $table->string('doi')->nullable()->after('pages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chapter_references', function (Blueprint $table) {
            $table->dropColumn(['authors', 'year', 'publication', 'volume', 'pages', 'doi']);
        });
    }
};
