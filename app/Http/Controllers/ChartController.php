<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use \App\Chart;
use \App\User;
use \Illuminate\Support\Facades\Auth;
use \App\Http\Requests\ChartRequest;

class ChartController extends Controller
{
    private $messages = [
        'saved' => 'Your chart has been saved.',
        '404' => 'That chart does not exist. A new chart has been created',
        'unauthorized' => 'You don\'t have permission to access that chart. A new chart has been created',
        'updated' => 'Your chart has been updated.',
        'save' => 'This public chart has been saved.'
    ];

    public function index() {
        return view( 'chart.new' );
    }

    public function create( ChartRequest $request ) {
        $req = $request->all();

        if ( Auth::check() )
        {
            $user = Auth::user();
            $req[ 'is_public' ] = false;
            $chart = Chart::create( $req );

            $user->charts()->save( $chart );
        }
        else
        {
            $req[ 'is_public' ] = true;
            $chart = Chart::create( $req );
        }

        return redirect( $request->input( 'hash' ) )->with([
            'flash' => $this->messages[ 'saved' ]
        ]);
    }

    public function show( $hash ) {
        $chart = Chart::where(DB::raw('BINARY `hash`'), $hash )->first();

        if ( ! $chart )
            return redirect( '/' )->with([
                'flash' => $this->messages[ '404' ]
            ]);

        // If user is logged in
        if ( Auth::check() )
        {
            $user = Auth::user();

            // If chart is owned by current user
            if ( $user->id === $chart->user_id )
                return view( 'chart.existing', ['chart' => $chart] );
        }

        // If chart is public
        if ( $chart->toArray()[ 'is_public' ] )
            return view( 'chart.existing', ['chart' => $chart] );

        // Unauthorized
        return redirect( '/' )->with([
            'flash' => $this->messages[ 'unauthorized' ]
        ]);
    }

    public function update( ChartRequest $request, $hash ) {
        $chart = Chart::where(DB::raw('BINARY `hash`'), $hash )->first();

        if ( ! $chart )
            return redirect( '/' )->with([
                'flash' => $this->messags[ '404' ]
            ]);

        // If user is logged in
        if ( Auth::check() )
        {
            $user = Auth::user();

            // If chart is owned by current user
            if ( $user->id === $chart->user_id )
            {
                $chart->update( $request->except([ 'hash' ]) );
                return redirect( $chart->hash )->with(
                    'flash', $this->messages[ 'updated' ]
                );
            }
        }

        // If this is a public chart
        $req = $request->all();
        if ( $chart->toArray()[ 'is_public' ] )
        {
            $chart->update( $request->except([ 'hash' ]) );
            return redirect( $hash )->with([
                'flash' => $this->messages[ 'updated' ]
            ]);
        }

        // If not logged in and not a public chart
        $req[ 'is_public' ] = true;
        $chart = Chart::create( $req );

        return redirect( $request->input( 'hash' ) )->with([
            'flash' => $this->messages[ 'unauthorized' ] . ' Changes have been preserved.'
        ]);
    }
}
