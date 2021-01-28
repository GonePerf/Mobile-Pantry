<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class product extends Model
{
    protected $fillable = ['product_name', 'quantity', 'weight', 'category', 'exp_date', 'place', 'comments'];
}
