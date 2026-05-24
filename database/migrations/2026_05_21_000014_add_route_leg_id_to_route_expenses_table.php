<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('route_expenses', function (Blueprint $table) {
            $table->foreignId('route_leg_id')
                ->nullable()
                ->after('route_id')
                ->constrained('route_legs')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->index(['route_leg_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::table('route_expenses', function (Blueprint $table) {
            $table->dropIndex(['route_leg_id', 'category']);
            $table->dropConstrainedForeignId('route_leg_id');
        });
    }
};
