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
        Schema::table('whatsapp_groups', function (Blueprint $table) {
            $table->dropForeign(['connection_id']);

            $table->foreign('connection_id')
                ->references('id')
                ->on('connections')
                ->onDelete('set null');

            $table->uuid('connection_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_groups', function (Blueprint $table) {

            $table->dropForeign(['connection_id']);

            $table->foreign('connection_id')
                ->references('id')
                ->on('connections')
                ->onDelete('cascade');

            $table->uuid('connection_id')->nullable(false)->change();
        });
    }
};
