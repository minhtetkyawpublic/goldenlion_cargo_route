<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteCargo extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'route_leg_id',
        'cargo_type',
        'description',
        'quantity',
        'unit',
        'unit_price',
        'total_price',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(CargoRoute::class, 'route_id');
    }

    public function leg(): BelongsTo
    {
        return $this->belongsTo(RouteLeg::class, 'route_leg_id');
    }
}
