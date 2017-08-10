<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\PublicChart;

class PublicChartController extends Controller
{
    public function index() {
        return view( 'chart.new' );
    }

    public function create(Request $request) {
        PublicChart::create( $request->all() );

        return redirect( 'p/' . $request->input( 'hash' ) )->with([
            'status' => 'Your chart has been saved.'
        ]);
    }

    public function show( $hash ) {
        $chart = PublicChart::where('hash', $hash)->first();

        if ( !$chart )
            return redirect('/')->with([
                'status' => 'That chart does not exist. A new chart has been created'
            ]);

        return view('chart.existing', ['chart' => $chart] );
    }

    public function update(Request $request, $hash ) {
        $chart = PublicChart::where('hash', $hash)->first();

        $chart->state = $request->input( 'state' );
        $chart->save();

        return redirect( 'p/' . $chart->hash );
    }
}
