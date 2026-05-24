<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('movement_type')->index();
            $table->decimal('quantity', 12, 3);
            $table->nullableMorphs('reference');
            $table->timestamp('moved_at')->nullable()->index();
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['inventory_item_id', 'moved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
