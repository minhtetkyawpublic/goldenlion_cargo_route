<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->string('repair_type')->nullable()->after('route_id');
            $table->decimal('quantity', 10, 2)->default(1)->after('repair_type');
            $table->decimal('unit_cost', 14, 2)->default(0)->after('quantity');
            $table->decimal('total_cost', 14, 2)->default(0)->after('unit_cost');
            $table->text('remark')->nullable()->after('total_cost');
            $table->index(['car_id', 'repaired_on', 'repair_type'], 'repairs_car_date_type_idx');
        });
    }

    public function down(): void
    {
        Schema::table('repairs', function (Blueprint $table) {
            $table->dropIndex('repairs_car_date_type_idx');
            $table->dropColumn([
                'repair_type',
                'quantity',
                'unit_cost',
                'total_cost',
                'remark',
            ]);
        });
    }
};
