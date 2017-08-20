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
Route::get('/', 'ChartController@index');

// Save New chart
Route::post('/', 'ChartController@create');

Auth::routes();

// Show a saved chart
Route::get('{hash}', 'ChartController@show');

// Update a chart
Route::post('{hash}', 'ChartController@update');


Route::get('/home', 'HomeController@index')->name('home');
