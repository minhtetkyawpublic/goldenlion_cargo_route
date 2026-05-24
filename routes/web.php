<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\RouteCargoController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\RouteExpenseController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/routes');

Route::get('/cars', [CarController::class, 'index']);
Route::post('/cars', [CarController::class, 'store']);
Route::get('/cars/{car}', [CarController::class, 'show']);
Route::post('/cars/{car}/repairs', [CarController::class, 'storeRepair']);
Route::delete('/cars/{car}/repairs/{repair}', [CarController::class, 'destroyRepair']);
Route::put('/cars/{car}', [CarController::class, 'update']);
Route::delete('/cars/{car}', [CarController::class, 'destroy']);

Route::get('/locations', [LocationController::class, 'index']);
Route::post('/locations', [LocationController::class, 'store']);
Route::put('/locations/{location}', [LocationController::class, 'update']);
Route::delete('/locations/{location}', [LocationController::class, 'destroy']);

Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/create', [RouteController::class, 'create']);
Route::post('/routes', [RouteController::class, 'store']);
Route::get('/routes/{route}', [RouteController::class, 'show']);
Route::post('/routes/{route}/finish', [RouteController::class, 'finish']);
Route::get('/routes/{route}/return', [RouteController::class, 'returnForm']);
Route::post('/routes/{route}/return', [RouteController::class, 'returnStore']);
Route::delete('/routes/{route}', [RouteController::class, 'destroy']);

Route::post('/routes/{route}/cargos', [RouteCargoController::class, 'store']);
Route::post('/routes/{route}/expenses', [RouteExpenseController::class, 'store']);

Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/history', [StockController::class, 'history']);
Route::post('/stocks/in', [StockController::class, 'storeIn']);
Route::post('/stocks/out', [StockController::class, 'storeOut']);
Route::put('/stocks/{stock}', [StockController::class, 'updateStock']);
Route::delete('/stocks/history/{movement}', [StockController::class, 'destroyMovement']);
