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
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['checkout_id']);
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->renameColumn('id', 'id_old');
            $table->dropPrimary();
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->id()->first();
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->dropColumn('id_old');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('checkout_id')
                ->references('id')
                ->on('credentials_checkout')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['checkout_id']);
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->renameColumn('id', 'id_new');
            $table->dropPrimary();
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->bigInteger('id')->primary()->nullable(false)->first();
        });

        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->dropColumn('id_new');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('checkout_id')
                ->references('id')
                ->on('credentials_checkout');
        });
    }
};
