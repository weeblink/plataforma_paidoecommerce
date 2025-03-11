<?php

use Illuminate\Support\Facades\Route;

Route::get('/email', function () {
    return view('mail.payment');
});

Route::get('/', function () {
    return view('welcome');
});

Route::get("/recovery", function(){
   return view('mail.recovery-password');
});
