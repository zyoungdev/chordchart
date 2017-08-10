<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// First entry into app
Route::get('/', 'PublicChartController@index');

// Save New chart
Route::post('/', 'PublicChartController@create');

// Show a saved chart
Route::get('p/{hash}', 'PublicChartController@show');

// Update a chart
Route::post('p/{hash}', 'PublicChartController@update');
