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
        Schema::create('participants', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('whatsapp_group_id')->nullable(false);
            $table->uuid('user_id')->nullable(false);
            $table->string('whatsapp_id')->nullable(false);
            $table->timestamp('created_at')->useCurrent()->nullable(false);

            $table->foreign('whatsapp_group_id')->references('id')->on('whatsapp_groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropForeign(['whatsapp_group_id']);
            $table->dropForeign(['user_id']);
            $table->dropIfExists();
        });
    }
};
