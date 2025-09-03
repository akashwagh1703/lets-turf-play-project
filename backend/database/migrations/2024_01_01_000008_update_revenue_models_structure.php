<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('revenue_models', function (Blueprint $table) {
            $table->decimal('monthly_price', 10, 2)->default(0)->after('price');
            $table->decimal('yearly_price', 10, 2)->default(0)->after('monthly_price');
            $table->integer('sort_order')->default(0)->after('status');
            $table->boolean('is_popular')->default(false)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('revenue_models', function (Blueprint $table) {
            $table->dropColumn(['monthly_price', 'yearly_price', 'sort_order', 'is_popular']);
        });
    }
};