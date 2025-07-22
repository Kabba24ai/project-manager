<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Optional: Add a login route for web interface if needed in the future
// Route::get('/login', function () {
//     return view('auth.login');
// })->name('login');