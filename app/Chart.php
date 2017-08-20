<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Chart extends Model
{
    protected $fillable = [
        'hash',
        'state',
        'title',
        'description',
        'is_public'
    ];

    protected $casts = [
        'state' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo( User::class );
    }
}
