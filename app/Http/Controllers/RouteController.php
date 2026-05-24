<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CargoRoute;
use App\Models\Location;
use App\Models\RouteCargo;
use App\Models\RouteExpense;
use App\Models\RouteLeg;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RouteController extends Controller
{
    private function finalizeRoute(CargoRoute $route, Carbon $endedAt): void
    {
        if ($route->status === 'finished') return;

        $route->update([
            'status' => 'finished',
            'ended_at' => $route->ended_at ?? $endedAt,
        ]);

        $returnLeg = RouteLeg::query()
            ->where('route_id', $route->id)
            ->where('sequence', 2)
            ->first();

        if ($returnLeg) {
            if ($returnLeg->started_at === null) {
                $returnLeg->update([
                    'started_at' => $returnLeg->started_at ?? $route->started_at,
                    'ended_at' => $returnLeg->ended_at ?? $endedAt,
                ]);
            } elseif ($returnLeg->ended_at === null) {
                $returnLeg->update([
                    'ended_at' => $endedAt,
                ]);
            }
        }

        $route->car()->update([
            'current_location_id' => $route->origin_location_id,
        ]);
    }

    public function index(Request $request): Response
    {
        $routesQuery = CargoRoute::query()
            ->with([
                'car:id,plate_number,current_location_id',
                'car.currentLocation:id,name',
            ])
            ->withSum('cargos as cargo_total', 'total_price')
            ->withSum('expenses as expense_total', 'amount')
            ->orderByRaw("case when status = 'finished' or ended_at is not null then 1 else 0 end asc")
            ->orderByDesc('started_at')
            ->orderByDesc('id');

        $carId = $request->string('car_id')->toString();
        if ($carId !== '') {
            $routesQuery->where('car_id', $carId);
        }

        $locationId = $request->string('location_id')->toString();
        if ($locationId !== '') {
            $routesQuery->where(function ($query) use ($locationId) {
                $query
                    ->where('origin_location_id', $locationId)
                    ->orWhere('destination_location_id', $locationId);
            });
        }

        $dateFrom = $request->string('date_from')->toString();
        if ($dateFrom !== '') {
            $routesQuery->whereDate('started_at', '>=', $dateFrom);
        }

        $dateTo = $request->string('date_to')->toString();
        if ($dateTo !== '') {
            $routesQuery->whereDate('started_at', '<=', $dateTo);
        }

        return Inertia::render('Routes/Index', [
            'filters' => [
                'car_id' => $carId,
                'location_id' => $locationId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'cars' => Car::query()->orderBy('plate_number')->get(['id', 'plate_number']),
            'locations' => Location::query()->orderBy('name')->get(['id', 'name', 'type']),
            'routes' => $routesQuery->paginate(15)->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        $mainBaseId = Location::query()
            ->where('type', 'main')
            ->orderBy('name')
            ->value('id');

        return Inertia::render('Routes/Create', [
            'cars' => Car::query()->orderBy('plate_number')->get(['id', 'plate_number']),
            'locations' => Location::query()->orderBy('name')->get(['id', 'name', 'type']),
            'main_base_id' => $mainBaseId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'car_id' => ['required', 'exists:cars,id'],
            'origin_location_id' => ['required', Rule::exists('locations', 'id')->where('type', 'main')],
            'destination_location_id' => ['required', Rule::exists('locations', 'id')->where('type', 'destination'), 'different:origin_location_id'],
            'started_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'cargos' => ['nullable', 'array'],
            'cargos.*.route_leg' => ['required_with:cargos', Rule::in(['outbound'])],
            'cargos.*.cargo_type' => ['nullable', 'string', 'max:100'],
            'cargos.*.description' => ['nullable', 'string', 'max:255'],
            'cargos.*.quantity' => ['required_with:cargos', 'numeric', 'min:0'],
            'cargos.*.unit' => ['nullable', 'string', 'max:50'],
            'cargos.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'expenses' => ['nullable', 'array'],
            'expenses.*.route_leg' => ['required_with:expenses', Rule::in(['outbound'])],
            'expenses.*.category' => ['required_with:expenses', 'string', 'max:100'],
            'expenses.*.description' => ['nullable', 'string', 'max:255'],
            'expenses.*.amount' => ['required_with:expenses', 'numeric', 'min:0'],
            'expenses.*.paid_at' => ['nullable', 'date'],
        ]);

        /** @var Car $car */
        $car = Car::query()->findOrFail($validated['car_id']);
        if ($car->current_location_id === null) {
            $car->update([
                'current_location_id' => $validated['origin_location_id'],
            ]);
        }

        $route = CargoRoute::create([
            'car_id' => $validated['car_id'],
            'origin_location_id' => $validated['origin_location_id'],
            'destination_location_id' => $validated['destination_location_id'],
            'status' => 'on_way',
            'started_at' => isset($validated['started_at']) ? Carbon::parse($validated['started_at']) : Carbon::now(),
            'ended_at' => null,
            'distance_km' => null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $outboundLeg = RouteLeg::create([
            'route_id' => $route->id,
            'sequence' => 1,
            'direction' => 'outbound',
            'from_location_id' => $route->origin_location_id,
            'to_location_id' => $route->destination_location_id,
            'started_at' => $route->started_at,
        ]);

        RouteLeg::create([
            'route_id' => $route->id,
            'sequence' => 2,
            'direction' => 'return',
            'from_location_id' => $route->destination_location_id,
            'to_location_id' => $route->origin_location_id,
            'started_at' => null,
            'ended_at' => null,
        ]);

        $car->update([
            'current_location_id' => $route->destination_location_id,
        ]);

        foreach (($validated['cargos'] ?? []) as $cargo) {
            $total = null;
            if (isset($cargo['unit_price'])) {
                $total = (float) $cargo['unit_price'] * (float) $cargo['quantity'];
            }

            RouteCargo::create([
                'route_id' => $route->id,
                'route_leg_id' => $outboundLeg->id,
                'cargo_type' => $cargo['cargo_type'] ?? null,
                'description' => $cargo['description'] ?? null,
                'quantity' => $cargo['quantity'],
                'unit' => $cargo['unit'] ?? null,
                'unit_price' => $cargo['unit_price'] ?? null,
                'total_price' => $total,
                'currency' => 'MMK',
            ]);
        }

        foreach (($validated['expenses'] ?? []) as $expense) {
            RouteExpense::create([
                'route_id' => $route->id,
                'route_leg_id' => $outboundLeg->id,
                'category' => $expense['category'],
                'description' => $expense['description'] ?? null,
                'amount' => $expense['amount'],
                'currency' => 'MMK',
                'paid_at' => isset($expense['paid_at']) ? Carbon::parse($expense['paid_at']) : null,
            ]);
        }

        return redirect('/routes/'.$route->id);
    }

    public function finish(CargoRoute $route): RedirectResponse
    {
        $this->finalizeRoute($route, Carbon::now());

        return redirect('/routes/'.$route->id);
    }

    public function returnForm(CargoRoute $route): Response
    {
        $route->load([
            'car:id,plate_number',
            'originLocation:id,name',
            'destinationLocation:id,name',
            'legs:id,route_id,sequence,direction,from_location_id,to_location_id,started_at,ended_at',
            'legs.fromLocation:id,name',
            'legs.toLocation:id,name',
        ]);

        $returnLeg = $route->legs->firstWhere('sequence', 2);

        return Inertia::render('Routes/Return', [
            'route' => $route,
            'return_leg_id' => $returnLeg?->id,
        ]);
    }

    public function returnStore(CargoRoute $route, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ended_at' => ['nullable', 'date'],
            'cargos' => ['nullable', 'array'],
            'cargos.*.cargo_type' => ['nullable', 'string', 'max:100'],
            'cargos.*.description' => ['nullable', 'string', 'max:255'],
            'cargos.*.quantity' => ['required_with:cargos', 'numeric', 'min:0'],
            'cargos.*.unit' => ['nullable', 'string', 'max:50'],
            'cargos.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'expenses' => ['nullable', 'array'],
            'expenses.*.category' => ['required_with:expenses', 'string', 'max:100'],
            'expenses.*.description' => ['nullable', 'string', 'max:255'],
            'expenses.*.amount' => ['required_with:expenses', 'numeric', 'min:0'],
            'expenses.*.paid_at' => ['nullable', 'date'],
        ]);

        $returnLeg = RouteLeg::query()
            ->where('route_id', $route->id)
            ->where('sequence', 2)
            ->firstOrFail();

        foreach (($validated['cargos'] ?? []) as $cargo) {
            $total = null;
            if (isset($cargo['unit_price'])) {
                $total = (float) $cargo['unit_price'] * (float) $cargo['quantity'];
            }

            RouteCargo::create([
                'route_id' => $route->id,
                'route_leg_id' => $returnLeg->id,
                'cargo_type' => $cargo['cargo_type'] ?? null,
                'description' => $cargo['description'] ?? null,
                'quantity' => $cargo['quantity'],
                'unit' => $cargo['unit'] ?? null,
                'unit_price' => $cargo['unit_price'] ?? null,
                'total_price' => $total,
                'currency' => 'MMK',
            ]);
        }

        foreach (($validated['expenses'] ?? []) as $expense) {
            RouteExpense::create([
                'route_id' => $route->id,
                'route_leg_id' => $returnLeg->id,
                'category' => $expense['category'],
                'description' => $expense['description'] ?? null,
                'amount' => $expense['amount'],
                'currency' => 'MMK',
                'paid_at' => isset($expense['paid_at']) ? Carbon::parse($expense['paid_at']) : null,
            ]);
        }

        $endedAt = isset($validated['ended_at']) ? Carbon::parse($validated['ended_at'])->endOfDay() : Carbon::now();
        $this->finalizeRoute($route, $endedAt);

        return redirect('/routes/'.$route->id);
    }

    public function destroy(CargoRoute $route): RedirectResponse
    {
        $car = $route->car;
        $destinationId = $route->destination_location_id;
        $originId = $route->origin_location_id;

        $route->delete();

        if ($car && $car->current_location_id === $destinationId) {
            $car->update([
                'current_location_id' => $originId,
            ]);
        }

        return redirect('/routes');
    }

    public function show(CargoRoute $route): Response
    {
        $route->load([
            'car:id,plate_number',
            'originLocation:id,name',
            'destinationLocation:id,name',
            'legs.fromLocation:id,name',
            'legs.toLocation:id,name',
            'cargos.leg:id,route_id,sequence,direction,from_location_id,to_location_id',
            'expenses.leg:id,route_id,sequence,direction,from_location_id,to_location_id',
        ]);

        $cargoTotal = $route->cargos()->sum('total_price');
        $expenseTotal = $route->expenses()->sum('amount');

        return Inertia::render('Routes/Show', [
            'route' => $route,
            'cargo_total' => $cargoTotal,
            'expense_total' => $expenseTotal,
            'profit' => $cargoTotal - $expenseTotal,
        ]);
    }
}
