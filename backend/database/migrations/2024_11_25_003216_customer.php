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
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->string('first_name', 255)->nullable(false);
            $table->string('last_name', 255)->nullable(false);
            $table->string('email', 255)->nullable(false);
            $table->string('phone', 15)->nullable(false);
            $table->string('document_type', 4)->nullable(false);
            $table->string('postcode', 8)->nullable(false);
            $table->string('street', 255)->nullable(false);
            $table->string('number', 20)->nullable(false);
            $table->string('district', 255)->nullable(false);
            $table->string('city', 255)->nullable(false);
            $table->string('state', 255)->nullable(false);
            $table->string('ip', 15)->nullable(false);
            $table->string('document_number', 14)->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIfExists();
        });
    }
};
