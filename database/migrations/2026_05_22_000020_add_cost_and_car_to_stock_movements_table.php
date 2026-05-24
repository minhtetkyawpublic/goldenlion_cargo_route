<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->decimal('unit_cost', 14, 2)->default(0)->after('quantity');
            $table->decimal('total_cost', 14, 2)->default(0)->after('unit_cost');
            $table->foreignId('car_id')
                ->nullable()
                ->after('inventory_item_id')
                ->constrained('cars')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->index(['warehouse_id', 'movement_type', 'moved_at'], 'stock_movements_wh_type_date_idx');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex('stock_movements_wh_type_date_idx');
            $table->dropConstrainedForeignId('car_id');
            $table->dropColumn([
                'unit_cost',
                'total_cost',
            ]);
        });
    }
};
