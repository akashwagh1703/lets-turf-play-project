<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add indexes for better query performance
        Schema::table('turfs', function (Blueprint $table) {
            $table->index(['owner_id', 'status']);
            $table->index('location');
            $table->index('created_at');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['turf_id', 'date']);
            $table->index(['user_id', 'status']);
            $table->index(['date', 'status']);
            $table->index('created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('email');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index(['owner_id', 'status']);
            $table->index(['end_date', 'status']);
        });
    }

    public function down()
    {
        Schema::table('turfs', function (Blueprint $table) {
            $table->dropIndex(['owner_id', 'status']);
            $table->dropIndex(['location']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['turf_id', 'date']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['date', 'status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['email']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex(['owner_id', 'status']);
            $table->dropIndex(['end_date', 'status']);
        });
    }
};