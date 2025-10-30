<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SemillasController;
use App\Http\Controllers\AnalisisSemillasController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\VariedadesController;
use App\Http\Controllers\ValidezController;
use App\Http\Controllers\CultivosController;
use App\Http\Controllers\DocumentosController;

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// App (protegido)
Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Registro de semillas
    Route::get('/registro', [SemillasController::class, 'index'])->name('semillas.index');
    Route::post('/semillas', [SemillasController::class, 'store'])->name('semillas.store');

    // Análisis: vistas y utilidades
    Route::get('/analisis/semillas', [AnalisisSemillasController::class, 'show'])->name('analisis.semillas');
    Route::post('/analisis/semillas/compute', [AnalisisSemillasController::class, 'compute'])->name('analisis.semillas.compute');
    Route::post('/analisis/semillas/recepcion', [AnalisisSemillasController::class, 'submitRecepcion'])->name('analisis.recepcion.submit');
    Route::get('/analisis/especies/suggest', [AnalisisSemillasController::class, 'suggestEspecies'])->name('analisis.especies.suggest');
    Route::get('/analisis/variedades/suggest', [AnalisisSemillasController::class, 'suggestVariedades'])->name('analisis.variedades.suggest');
    Route::get('/analisis/humedad', [AnalisisSemillasController::class, 'humidity'])->name('analisis.humedad');
    Route::post('/analisis/humedad', [AnalisisSemillasController::class, 'submitHumidity'])->name('analisis.humedad.submit');
    Route::post('/analisis/pureza/finalizar', [AnalisisSemillasController::class, 'finalize'])->name('analisis.finalizar');

    // Documentos
    Route::get('/documentos', [DocumentosController::class, 'index'])->name('documentos.index');
    Route::get('/documentos/{doc}/imprimir', [DocumentosController::class, 'imprimir'])->whereNumber('doc')->name('documentos.print');
    Route::get('/documentos/{doc}', [DocumentosController::class, 'show'])->whereNumber('doc')->name('documentos.show');
    Route::get('/documentos/{doc}/edit', [DocumentosController::class, 'edit'])->whereNumber('doc')->name('documentos.edit');
    Route::put('/documentos/{doc}', [DocumentosController::class, 'update'])->whereNumber('doc')->name('documentos.update');
    Route::delete('/documentos/{doc}', [DocumentosController::class, 'destroy'])->whereNumber('doc')->name('documentos.destroy');

    // Descarga general (merge de PDFs por rango)
    Route::get('/documentos/descarga-general', [DocumentosController::class, 'bulkForm'])->name('documentos.bulk');
    Route::post('/documentos/descarga-general', [DocumentosController::class, 'bulkDownload'])->name('documentos.bulk_download');

    // Variedades
    Route::get('/variedades', [VariedadesController::class, 'index'])->name('variedades.index');
    Route::get('/variedades/create', [VariedadesController::class, 'create'])->name('variedades.create');
    Route::post('/variedades', [VariedadesController::class, 'store'])->name('variedades.store');
    Route::get('/variedades/cultivo/{cultivo}', [VariedadesController::class, 'manage'])->name('variedades.manage');
    Route::put('/variedades/cultivo/{cultivo}', [VariedadesController::class, 'bulkUpdate'])->name('variedades.manage.update');
    Route::get('/variedades/{variedad}/edit', [VariedadesController::class, 'edit'])->name('variedades.edit');
    Route::put('/variedades/{variedad}', [VariedadesController::class, 'update'])->name('variedades.update');
    Route::delete('/variedades/{variedad}', [VariedadesController::class, 'destroy'])->name('variedades.destroy');

    // Validez de análisis
    Route::get('/validez', [ValidezController::class, 'index'])->name('validez.index');
    Route::get('/validez/create', [ValidezController::class, 'create'])->name('validez.create');
    Route::post('/validez', [ValidezController::class, 'store'])->name('validez.store');
    Route::get('/validez/{validez}/edit', [ValidezController::class, 'edit'])->name('validez.edit');
    Route::put('/validez/{validez}', [ValidezController::class, 'update'])->name('validez.update');
    Route::delete('/validez/{validez}', [ValidezController::class, 'destroy'])->name('validez.destroy');

    // Cultivos CRUD
    Route::resource('cultivos', CultivosController::class)->except(['show']);
});
