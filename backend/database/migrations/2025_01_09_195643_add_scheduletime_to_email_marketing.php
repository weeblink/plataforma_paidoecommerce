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
        Schema::table('email_marketing', function (Blueprint $table) {
            $table->string('subject')->nullable(false)->after('broadcast');
            $table->boolean('scheduled')->default(false)->after('file_url');
            $table->dateTime('schedule_time')->nullable()->after('scheduled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_marketing', function (Blueprint $table) {
            $table->dropColumn('subject');
            $table->dropColumn('scheduled');
            $table->dropColumn('schedule_time');
        });
    }
};
