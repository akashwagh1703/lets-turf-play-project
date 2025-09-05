<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'business_description')) {
                $table->text('business_description')->nullable();
            }
            if (!Schema::hasColumn('users', 'business_logo')) {
                $table->string('business_logo')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['business_description', 'business_logo']);
        });
    }
};