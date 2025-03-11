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
        Schema::create('email_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('email_id')->nullable(false);
            $table->uuid('lead_id')->nullable(false);

            $table->foreign('email_id')->references('id')->on('email_marketing')->onDelete('cascade');
            $table->foreign('lead_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_metrics', function (Blueprint $table) {
            $table->dropForeign(['email_id']);
            $table->dropForeign(['lead_id']);
            $table->dropIfExists();
        });
    }
};
