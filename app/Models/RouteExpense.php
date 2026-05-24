<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'route_leg_id',
        'category',
        'description',
        'amount',
        'currency',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
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
