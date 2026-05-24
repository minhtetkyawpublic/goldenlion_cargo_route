<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouse_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete()->cascadeOnUpdate();
            $table->decimal('quantity_on_hand', 12, 3)->default(0);
            $table->timestamps();

            $table->unique(['warehouse_id', 'inventory_item_id']);
            $table->index(['inventory_item_id', 'warehouse_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_stocks');
    }
};
