<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->string('car_type')->nullable()->after('plate_number');
            $table->string('driver_name')->nullable()->after('car_type');
            $table->string('remark')->nullable()->after('driver_name');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn(['car_type', 'driver_name', 'remark']);
        });
    }
};
