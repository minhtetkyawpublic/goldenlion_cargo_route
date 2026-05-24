<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'address',
        'phone_numbers',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'phone_numbers' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function originRoutes(): HasMany
    {
        return $this->hasMany(CargoRoute::class, 'origin_location_id');
    }

    public function destinationRoutes(): HasMany
    {
        return $this->hasMany(CargoRoute::class, 'destination_location_id');
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class, 'location_id');
    }

    public function legsFromHere(): HasMany
    {
        return $this->hasMany(RouteLeg::class, 'from_location_id');
    }

    public function legsToHere(): HasMany
    {
        return $this->hasMany(RouteLeg::class, 'to_location_id');
    }
}
