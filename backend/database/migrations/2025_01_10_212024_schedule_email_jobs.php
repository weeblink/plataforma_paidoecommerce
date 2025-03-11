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
        Schema::create('schedule_email_jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id')->nullable(false)->unique();
            $table->uuid('email_id')->nullable(false);
            $table->uuid('lead_id')->nullable(false);
            $table->timestamps();

            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->foreign('lead_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('email_id')->references('id')->on('email_marketing')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedule_email_jobs', function (Blueprint $table) {
            $table->dropForeign(['lead_id']);
            $table->dropForeign(['email_id']);
            $table->dropIfExists();
        });
    }
};
