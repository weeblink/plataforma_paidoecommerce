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
        Schema::create('credentials_checkout', function (Blueprint $table) {
            $table->biginteger('id')->primary()->nullable(false);
            $table->string('token', 255)->nullable(false);
            $table->string('client_id', 255)->nullable(false);
            $table->string('client_secret', 255)->nullable(false);
            $table->string('app_name', 100)->nullable(false);
            $table->string('app_id', 255)->nullable(false);
            $table->timestamp('expires_in')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credentials_checkout', function (Blueprint $table) {
            $table->dropIfExists();
        });
    }
};
