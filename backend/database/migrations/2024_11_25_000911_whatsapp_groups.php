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
        Schema::create('whatsapp_groups', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('group_mentorship_id')->nullable(false);
            $table->uuid('connection_id')->nullable(false);
            $table->string('whatsapp_id')->nullable(false);
            $table->string('subject')->nullable(false);
            $table->timestamp('creation')->nullable(false);
            $table->string('owner')->nullable(false);
            $table->text('desc')->nullable(false);
            $table->boolean('announce')->default(false)->nullable(false);
            $table->boolean('restrict')->default(true)->nullable(false);

            $table->foreign('group_mentorship_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('connection_id')->references('id')->on('connections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_groups', function (Blueprint $table) {
            $table->dropForeign(['group_mentorship_id']);
            $table->dropForeign(['connection_id']);
            $table->dropIfExists();
        });
    }
};
