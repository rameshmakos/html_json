<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('MediumTerm','App\Http\Controllers\HomeController@index');
Route::get('ShortTerm','App\Http\Controllers\HomeController@show');

Route::get('MediumTerm_data','App\Http\Controllers\HomeController@MediumTerm_data');
Route::get('ShortTerm_data','App\Http\Controllers\HomeController@ShortTerm_data');
//Route::get('insert','App\Http\Controllers\HomeController@insert');

Route::get('BigGems_data','App\Http\Controllers\HomeController@BigGems_data');
Route::get('OptionCalls_data','App\Http\Controllers\HomeController@OptionCalls_data');
