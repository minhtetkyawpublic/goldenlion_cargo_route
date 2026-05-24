<?php

namespace App\Http\Controllers;

use App\Models\CargoRoute;
use App\Models\RouteExpense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class RouteExpenseController extends Controller
{
    public function store(CargoRoute $route, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'route_leg_id' => [
                'nullable',
                Rule::exists('route_legs', 'id')->where('route_id', $route->id),
            ],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'paid_at' => ['nullable', 'date'],
        ]);

        RouteExpense::create([
            'route_id' => $route->id,
            'route_leg_id' => $validated['route_leg_id'] ?? null,
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'currency' => 'MMK',
            'paid_at' => isset($validated['paid_at']) ? Carbon::parse($validated['paid_at']) : null,
        ]);

        return redirect('/routes/'.$route->id);
    }
}
