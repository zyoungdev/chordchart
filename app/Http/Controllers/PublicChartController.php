<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\PublicChart;

class PublicChartController extends Controller
{
    public function show( $hash ) {
        $chart = PublicChart::where('hash', $hash)->first();

        // dd( $chart );
        return view('chart.main', ['chart' => $chart] );
    }
}
