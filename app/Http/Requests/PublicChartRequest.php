<?php

namespace App\Http\Requests;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;

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

    private function validate_state( $state ){
        $valid_state = json_decode( $state );
        if ( is_null( $valid_state ) )
            return false;

        return true;
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
