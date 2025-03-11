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
        Schema::create('groups', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('mentorship_id')->nullable(false);
            $table->uuid('course_id')->nullable(false);
            $table->string('title', 100)->nullable(false);
            $table->decimal('price', 10, 2)->nullable(false);
            $table->decimal('price_promotional', 10, 2)->nullable(false);
            $table->integer('qnt_students')->default(0)->nullable(false);
            $table->timestamp('purchase_deadline')->nullable(false);
            $table->timestamp('expiration_date')->nullable(false);
            $table->enum('type', ['group', 'single'])->nullable(false);

            $table->foreign('mentorship_id')->references('id')->on('mentorships')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['mentorship_id']);
            $table->dropForeign(['course_id']);
            $table->dropIfExists();
        });
    }
};
