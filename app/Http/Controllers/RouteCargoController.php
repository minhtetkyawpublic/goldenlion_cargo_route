<?php

namespace App\Http\Controllers;

use App\Models\CargoRoute;
use App\Models\RouteCargo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RouteCargoController extends Controller
{
    public function store(CargoRoute $route, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'route_leg_id' => [
                'nullable',
                Rule::exists('route_legs', 'id')->where('route_id', $route->id),
            ],
            'cargo_type' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $totalPrice = null;
        if (isset($validated['unit_price'])) {
            $totalPrice = (float) $validated['unit_price'] * (float) $validated['quantity'];
        }

        RouteCargo::create([
            'route_id' => $route->id,
            'route_leg_id' => $validated['route_leg_id'] ?? null,
            'cargo_type' => $validated['cargo_type'] ?? null,
            'description' => $validated['description'] ?? null,
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? null,
            'unit_price' => $validated['unit_price'] ?? null,
            'total_price' => $totalPrice,
            'currency' => 'MMK',
        ]);

        return redirect('/routes/'.$route->id);
    }
}
