<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\AnalisisSemillasController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ComunidadesController;
use App\Http\Controllers\CultivosController;
use App\Http\Controllers\DocumentosController;
use App\Http\Controllers\UserLoginController;
use App\Http\Controllers\ValidezController;
use App\Http\Controllers\VariedadesController;
use App\Http\Controllers\Ui\Admin\UsersIndexController;
use App\Http\Controllers\Ui\Admin\UsersManagementController;

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [UserLoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [UserLoginController::class, 'login'])->name('login.attempt');
    Route::post('/admin/login', [AdminLoginController::class, 'login'])->name('admin.login.attempt');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// App (protegido)
Route::middleware('auth')->group(function () {
    Route::get('/', fn () => redirect()->route('ui.dashboard'))->name('dashboard');

    // UI principal vía Inertia + React (Joy UI)

    // An?lisis: vistas y utilidades
    Route::get('/analisis/semillas', [AnalisisSemillasController::class, 'show'])->name('analisis.semillas');
    Route::post('/analisis/semillas/compute', [AnalisisSemillasController::class, 'compute'])->name('analisis.semillas.compute');
    Route::post('/analisis/semillas/recepcion', [AnalisisSemillasController::class, 'submitRecepcion'])->name('analisis.recepcion.submit');
    Route::post('/analisis/semillas/reset', [AnalisisSemillasController::class, 'reset'])->name('analisis.semillas.reset');
    Route::get('/analisis/especies/suggest', [AnalisisSemillasController::class, 'suggestEspecies'])->name('analisis.especies.suggest');
    Route::get('/analisis/variedades/suggest', [AnalisisSemillasController::class, 'suggestVariedades'])->name('analisis.variedades.suggest');
    Route::get('/comunidades/suggest', [ComunidadesController::class, 'suggest'])->name('comunidades.suggest');
    Route::get('/analisis/humedad', [AnalisisSemillasController::class, 'humidity'])->name('analisis.humedad');
    Route::post('/analisis/humedad', [AnalisisSemillasController::class, 'submitHumidity'])->name('analisis.humedad.submit');
    Route::post('/analisis/pureza/finalizar', [AnalisisSemillasController::class, 'finalize'])->name('analisis.finalizar');

    // Documentos
    Route::get('/documentos', [DocumentosController::class, 'index'])->name('documentos.index');
    Route::post('/documentos', [DocumentosController::class, 'store'])->name('documentos.store');
    Route::get('/documentos/{doc}/imprimir', [DocumentosController::class, 'imprimir'])->whereNumber('doc')->name('documentos.print');
    Route::get('/documentos/{doc}', [DocumentosController::class, 'show'])->whereNumber('doc')->name('documentos.show');
    Route::get('/documentos/{doc}/edit', [DocumentosController::class, 'edit'])->whereNumber('doc')->name('documentos.edit');
    Route::put('/documentos/{doc}', [DocumentosController::class, 'update'])->whereNumber('doc')->name('documentos.update');
    Route::delete('/documentos/{doc}', [DocumentosController::class, 'destroy'])->whereNumber('doc')->name('documentos.destroy')->middleware('access:deleteDocs');

    // Comunidades (edición rápida desde UI moderna)
    Route::post('/comunidades', [ComunidadesController::class, 'store'])->name('comunidades.store');
    Route::put('/comunidades/{comunidad}', [ComunidadesController::class, 'update'])->name('comunidades.update');
    Route::delete('/comunidades/{comunidad}', [ComunidadesController::class, 'destroy'])->name('comunidades.destroy');

    // Descarga general (merge de PDFs por rango)
    Route::get('/documentos/descarga-general', [DocumentosController::class, 'bulkForm'])->name('documentos.bulk');
    Route::post('/documentos/descarga-general', [DocumentosController::class, 'bulkDownload'])->name('documentos.bulk_download');

    // Variedades
    Route::middleware('access:manageCatalogs')->group(function () {
        Route::get('/variedades', [VariedadesController::class, 'index'])->name('variedades.index');
        Route::get('/variedades/create', [VariedadesController::class, 'create'])->name('variedades.create');
        Route::post('/variedades', [VariedadesController::class, 'store'])->name('variedades.store');
        Route::get('/variedades/cultivo/{cultivo}', [VariedadesController::class, 'manage'])->name('variedades.manage');
        Route::put('/variedades/cultivo/{cultivo}', [VariedadesController::class, 'bulkUpdate'])->name('variedades.manage.update');
        Route::get('/variedades/{variedad}/edit', [VariedadesController::class, 'edit'])->name('variedades.edit');
        Route::put('/variedades/{variedad}', [VariedadesController::class, 'update'])->name('variedades.update');
        Route::delete('/variedades/{variedad}', [VariedadesController::class, 'destroy'])->name('variedades.destroy');
    });
    Route::get('/backups/export', [\App\Http\Controllers\BackupsController::class, 'export'])->name('backups.export')->middleware('access:exportData');
    Route::post('/backups/generate', [\App\Http\Controllers\BackupsController::class, 'generate'])->name('backups.generate')->middleware('access:exportData');
    Route::get('/backups/download', [\App\Http\Controllers\BackupsController::class, 'download'])->name('backups.download')->middleware('access:exportData');
    Route::delete('/backups/delete', [\App\Http\Controllers\BackupsController::class, 'destroy'])->name('backups.delete')->middleware('access:deleteBackups');
    Route::post('/backups/import', [\App\Http\Controllers\BackupsController::class, 'import'])->name('backups.import')->middleware('access:restoreData');

    // Validez de an?lisis

    // Cultivos CRUD
    Route::resource('cultivos', CultivosController::class)->except(['show'])->middleware('access:manageCatalogs');
});



Route::middleware('auth')->group(function () {
    Route::get('/ui', [\App\Http\Controllers\Ui\DashboardUiController::class, 'index'])->name('ui.dashboard');
    Route::get('/ui/documentos', [\App\Http\Controllers\Ui\DocumentosUiController::class, 'index'])->name('ui.documentos');
    Route::get('/ui/documentos/create', [\App\Http\Controllers\Ui\DocumentosUiController::class, 'create'])->name('ui.documentos.create');
    Route::get('/ui/documentos/descarga-general', [\App\Http\Controllers\Ui\DocumentosUiController::class, 'bulk'])->name('ui.documentos.bulk');
    Route::get('/ui/documentos/{doc}/edit', [\App\Http\Controllers\Ui\DocumentosUiController::class, 'edit'])->whereNumber('doc')->name('ui.documentos.edit');
    Route::get('/ui/analisis/semillas', function () {
        $cultivos = \App\Models\Cultivo::orderBy('especie')
            ->get(['id','especie','categoria_inicial','categoria_final']);
        $recepcion = session()->get('analisis.recepcion', []);

        return \Inertia\Inertia::render('Analisis/Semillas', [
            'today' => now()->format('Y-m-d'),
            'cultivos' => $cultivos,
            'recepcion' => $recepcion,
        ]);
    })->name('ui.analisis.semillas');
    Route::get('/ui/documentos/{doc}/imprimir', [\App\Http\Controllers\Ui\DocumentosUiController::class, 'autoprint'])->whereNumber('doc')->name('ui.documentos.print');
    Route::get('/ui/cultivos', [\App\Http\Controllers\Ui\CultivosUiController::class, 'index'])->name('ui.cultivos')->middleware('access:manageCatalogs');
    Route::get('/ui/cultivos/create', [\App\Http\Controllers\Ui\CultivosUiController::class, 'create'])->name('ui.cultivos.create')->middleware('access:manageCatalogs');
    Route::get('/ui/cultivos/{cultivo}/edit', [\App\Http\Controllers\Ui\CultivosUiController::class, 'edit'])->whereNumber('cultivo')->name('ui.cultivos.edit')->middleware('access:manageCatalogs');
    Route::get('/ui/variedades', [\App\Http\Controllers\Ui\VariedadesUiController::class, 'index'])->name('ui.variedades')->middleware('access:manageCatalogs');
    Route::get('/ui/variedades/create', [\App\Http\Controllers\Ui\VariedadesUiController::class, 'create'])->name('ui.variedades.create')->middleware('access:manageCatalogs');
    Route::get('/ui/variedades/{variedad}/edit', [\App\Http\Controllers\Ui\VariedadesUiController::class, 'edit'])->whereNumber('variedad')->name('ui.variedades.edit')->middleware('access:manageCatalogs');
    Route::get('/ui/variedades/cultivo/{cultivo}', [\App\Http\Controllers\Ui\VariedadesUiController::class, 'manage'])->whereNumber('cultivo')->name('ui.variedades.manage')->middleware('access:manageCatalogs');
    Route::get('/ui/backups', [\App\Http\Controllers\Ui\BackupsUiController::class, 'index'])->name('ui.backups');
    Route::middleware('admin')->group(function () {
        Route::get('/ui/roles-permisos', [\App\Http\Controllers\Ui\RolesPermisosController::class, 'index'])->name('ui.roles-permisos');
        Route::post('/ui/roles-permisos', [\App\Http\Controllers\Ui\RolesPermisosController::class, 'update'])->name('ui.roles-permisos.update');

        Route::get('/ui/usuarios', [UsersIndexController::class, 'index'])->name('ui.usuarios');
        Route::post('/ui/usuarios', [UsersManagementController::class, 'store'])->name('ui.usuarios.store');
        Route::get('/ui/usuarios/{user}/edit', [UsersManagementController::class, 'edit'])->whereNumber('user')->name('ui.usuarios.edit');
        Route::put('/ui/usuarios/{user}', [UsersManagementController::class, 'update'])->whereNumber('user')->name('ui.usuarios.update');
        Route::delete('/ui/usuarios/{user}', [UsersManagementController::class, 'destroy'])->whereNumber('user')->name('ui.usuarios.destroy');
        Route::post('/ui/usuarios/{user}/toggle', [UsersManagementController::class, 'toggle'])->whereNumber('user')->name('ui.usuarios.toggle');
    });
    Route::get('/ui/password', [AuthController::class, 'showChangePassword'])->name('password.edit');
    Route::post('/ui/password', [AuthController::class, 'updatePassword'])->name('password.update');
});


