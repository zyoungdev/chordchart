<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PublicChart extends Model
{
    protected $fillable = [
        'hash',
        'state'
    ];
}
