<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\PublicChart;

class PublicChartController extends Controller
{
    public function index() {
        return view('index');
    }

    public function create(Request $request) {
        PublicChart::create( $request->all() );

        return redirect( 'p/' . $request->input( 'hash' ) );
    }

    public function show( $hash ) {
        $chart = PublicChart::where('hash', $hash)->first();

        return view('chart.main', ['chart' => $chart] );
    }

    public function update(Request $request, $hash ) {
        $chart = PublicChart::where('hash', $hash)->first();

        $chart->state = $request->input( 'state' );
        $chart->save();

        return redirect( 'p/' . $chart->hash );
    }
}
