<?php

namespace App\Http\Requests;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PublicChartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    private function validate_hash( $hash ){
        $hash_arr = str_split( $hash );
        for ($i = 0;  $i < count( $hash_arr );  $i++ )
            if ( strpos( env( 'APP_HASH_POOL' ), $hash_arr[ $i ] ) === false )
                return false;

        return true;
    }

    private function validate_state_engine( $engine ) {
        if ( filter_var( $engine[ "tempo" ], FILTER_VALIDATE_INT ) === false ) {
            log::debug( 'engine.tempo != integer' );
            return false;
        }

        return true;
    }

    private function validate_state_globalState( $globalState ) {
        $pass = filter_var( $globalState[ 'debug' ], FILTER_VALIDATE_BOOLEAN );
        if ( $pass === false )
            Log::debug( 'globalState.debug != boolean' );

        $pass = filter_var( $globalState[ 'isRunning' ], FILTER_VALIDATE_BOOLEAN );
        if ( !( $pass === false || $pass === true ) )
            Log::debug( 'globalState.isRunning != boolean' );

        $pass = filter_var( $globalState[ 'MaxLookAhead' ], FILTER_VALIDATE_FLOAT );
        if ( $pass === false )
            Log::debug( 'globalState.MaxLookAhead != float' );

        $pass = filter_var( $globalState[ 'lookAhead' ], FILTER_VALIDATE_FLOAT );
        if ( $pass === false )
            Log::debug( 'globalState.lookAhead != float' );

        return $pass;
    }

    private function validate_state_chart( $chart ) {
        $pass = false;
        foreach ( $chart[ 'bars' ] as $bar )
        {
            $pass = empty( $bar[ 'element' ] );
            if ( $pass === false )
                Log::debug( 'chart.bar.element is not empty. Element Should be empty array.' );

            // Catch non-valid characters
            $bar[ 'chordName' ] = preg_grep("/[A-Za-z]*/", str_split( $bar[ 'chordName' ] ), PREG_GREP_INVERT);
            $pass = empty( $bar[ 'chordName' ] );
            if ( $pass === false )
            {
                Log::debug( 'chart.bar.chordName is invalid data. \n chordName: ' );
                Log::debug( $bar[ 'chordName' ] );
            }

            // Catch non-valid characters
            $bar[ 'chordQuality' ] = preg_grep("/[A-Za-z0-9]*/", str_split( $bar[ 'chordQuality' ] ), PREG_GREP_INVERT);
            $pass = empty( $bar[ 'chordQuality' ] );
            if ( $pass === false )
            {
                Log::debug( 'chart.bar.chordQuality is invalid data. \n chordQuality: ' );
                Log::debug( $bar[ 'chordQuality' ] );
            }

            foreach( $bar[ 'rhythm' ] as $pad )
            {
                $pass = filter_var( $pad, FILTER_VALIDATE_INT );
                if ( $pass === false  )
                    Log::debug( 'chart.bar.rhythm.pad is not integer.' );
            }
        }

        foreach ( $chart[ 'defaultSequence' ] as $pad )
        {
            $pass = filter_var( $pad, FILTER_VALIDATE_INT );
            if ( $pass === false  )
                Log::debug( 'chart.defaultSequence.pad is not integer.' );
        }
        return $pass;
    }
    private function validate_state_instruments( $instruments ) {
        $pass = false;
        $metronome = $instruments[ 0 ];
        $piano = $instruments[ 1 ];

        /**********************************************************
        *                       metronome
        **********************************************************/
            $pass = filter_var( $metronome[ 'root' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'metronome.root is not integer.' );

            $pass = filter_var( $metronome[ 'volume' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'metronome.volume is not integer.' );

            $pass = filter_var( $metronome[ 'clickLength' ], FILTER_VALIDATE_FLOAT );
            if ( $pass === false )
                Log::debug( 'metronome.clickLength is not float.' );

            $pass = filter_var( $metronome[ 'waveType' ], FILTER_SANITIZE_STRING );
            if ( $pass === false )
                Log::debug( 'metronome.waveType is not float.' );

            foreach( $metronome[ 'sequence' ] as $pad )
            {
                $pass = filter_var( $pad, FILTER_VALIDATE_INT );
                if ( $pass === false )
                    Log::debug( 'metronome.sequence.pad is not integer.' );
            }

        /**********************************************************
        *                       piano
        **********************************************************/
            $pass = filter_var( $piano[ 'volume' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'piano.volume is not integer.' );

            $pass = filter_var( $piano[ 'playableOctave' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'piano.playableOctave is not integer.' );

            $pass = filter_var( $piano[ 'transpose' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'piano.transpose is not integer.' );

            $pass = filter_var( $piano[ 'additionalNoteLength' ], FILTER_VALIDATE_INT );
            if ( $pass === false )
                Log::debug( 'piano.additionalNoteLength is not integer.' );

            foreach( $piano[ 'sequence' ] as $pad )
            {
                $pass = filter_var( $pad, FILTER_VALIDATE_INT );
                if ( $pass === false )
                    Log::debug( 'piano.sequence.pad is not integer.' );
            }

        return $pass;
    }

    private function validate_state( $state ){
        $vs = json_decode( $state, true );

        // If not valid JSON, return as invalid
        if ( is_null( $vs ) )
            return false;

        $pass = $this->validate_state_engine( $vs[ 'engine' ] );
        $pass ? Log::debug( 'engine valid' ) : Log::debug( 'engine not valid' );
        $pass = $this->validate_state_globalState( $vs[ 'globalState' ] );
        $pass ? Log::debug( 'globalState valid' ) : Log::debug( 'globalState not valid' );
        $pass = $this->validate_state_chart( $vs[ 'chart' ] );
        $pass ? Log::debug( 'chart valid' ) : Log::debug( 'chart not valid' );
        $pass = $this->validate_state_instruments( $vs[ 'instruments' ] );
        $pass ? Log::debug( 'instruments valid' ) : Log::debug( 'instruments not valid' );

        return $pass;
    }

    private function validate_title( $title ){
        return true;
    }

    private function validate_description( $description ){
        return true;
    }

    public function withValidator( $validator )
    {
        $validator->after( function( $validator ) {
            if ( !$this->validate_hash( Request::input( 'hash' ) ) )
                $validator->errors()->add( 'hash', "That is not a valid hash" );
        });

        $validator->after( function( $validator ) {
            if ( !$this->validate_state( Request::input( 'state' ) ) )
                $validator->errors()->add( 'state', "That is not a valid state" );
        });

        $validator->after( function( $validator ) {
            if ( !$this->validate_title( Request::input( 'title' ) ) )
                $validator->errors()->add( 'title', "That is not a valid title" );
        });

        $validator->after( function( $validator ) {
            if ( !$this->validate_description( Request::input( 'description' ) ) )
                $validator->errors()->add( 'description', "That is not a valid description" );
        });
    }

    public function sanitize()
    {
        $input = $this->all();

        $input[ 'hash' ] = filter_var( $input['hash'], FILTER_SANITIZE_STRING);
        $input[ 'title' ] = filter_var( $input['title'], FILTER_SANITIZE_STRING);
        $input[ 'description' ] = filter_var( $input['description'], FILTER_SANITIZE_STRING);

        $this->replace( $input );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $this->sanitize();

        return [
            'hash' => 'required|unique:public_charts,hash|max:' . env( 'APP_HASH_SIZE' ) . '|min:' . env( 'APP_HASH_SIZE' ),
            'state' => 'required',
            'title' => 'max:256|nullable',
            'description' => 'max:4096|nullable'
        ];
    }

}
