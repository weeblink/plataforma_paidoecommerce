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
        Schema::table('user_products', function (Blueprint $table) {

            $table->dropForeign(['mentorship_id']);

            $table->dropColumn('mentorship_id');

            $table->uuid('group_id')->nullable();

            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_products', function (Blueprint $table) {

            $table->dropForeign(['group_id']);

            $table->dropColumn('group_id');

            $table->uuid('mentorship_id')->nullable();

            $table->foreign('mentorship_id')->references('id')->on('mentorships')->onDelete('cascade');
        });
    }
};
