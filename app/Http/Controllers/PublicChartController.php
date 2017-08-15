<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\PublicChart;
use \App\Http\Requests\PublicChartRequest;

class PublicChartController extends Controller
{
    public function index() {
        return view( 'chart.new' );
    }

    public function create( PublicChartRequest $request ) {
        PublicChart::create( $request->all() );

        return redirect( 'p/' . $request->input( 'hash' ) )->with([
            'flash' => 'Your chart has been saved.'
        ]);
    }

    public function show( $hash ) {
        $chart = PublicChart::where( 'hash', $hash )->first();

        if ( !$chart )
            return redirect( '/' )->with([
                'flash' => 'That chart does not exist. A new chart has been created'
            ]);

        return view( 'chart.existing', ['chart' => $chart] );
    }

    public function update( PublicChartRequest $request, $hash ) {
        $chart = PublicChart::where( 'hash', $hash )->first();

        $chart->update( $request->all() );

        return redirect( 'p/' . $chart->hash )->with(
            'flash',  'Your chart has been updated.'
        );
    }
}
