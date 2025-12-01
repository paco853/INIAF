<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Acceso denegado</title>
    @vite('resources/css/pages/access-denied.css')
</head>
<body>
    <div class="access-denied-page">
        <div class="access-card">
            <div class="window-header">
                <div class="window-dots">
                    <span class="dot dot-red"></span>
                    <span class="dot dot-yellow"></span>
                    <span class="dot dot-green"></span>
                </div>
                <span class="window-context">Sistema / Seguridad</span>
            </div>
            <div class="icon-circle">
                <span class="lock-icon">🔒</span>
            </div>
            <h1>Acceso denegado</h1>
            <p>No pudimos verificar tus permisos para acceder a este módulo.</p>
            <p>Por favor verifica que tu sesión esté activa.</p>
            <div class="actions">
                <a class="btn-primary" href="{{ url()->previous() ?: route('dashboard') }}">
                    ← Volver a la página anterior
                </a>
                <span class="error-code">
                    CÓDIGO DE ERROR: 403 FORBIDDEN
                </span>
            </div>
        </div>
    </div>
</body>
</html>
