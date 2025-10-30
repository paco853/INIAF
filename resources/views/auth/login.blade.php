<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión - Registro de Semillas</title>
    <link rel="stylesheet" href="/assets/css/auth.css">
</head>
<body class="login-body">
    <main class="login-card">
        <h1 class="login-title">REGISTRO DE SEMILLAS INIAF</h1>
        <h2 class="login-subtitle">Iniciar sesión</h2>

        <?php if ($errors->any()): ?>
            <div class="alert">
                <?php foreach ($errors->all() as $error): ?>
                    <div><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?= route('login.attempt') ?>" class="form">
            <?= csrf_field() ?>
            <label class="field">
                <span>Correo</span>
                <input type="email" name="email" value="<?= old('email') ?>" required>
            </label>
            <label class="field">
                <span>Contraseña</span>
                <input type="password" name="password" required>
            </label>
            <label class="checkbox">
                <input type="checkbox" name="remember"> Recordarme
            </label>
            <button type="submit" class="btn-primary">Entrar</button>
        </form>
        <p class="hint">Usuario de prueba: admin@example.com / password</p>
        <p class="hint">¿No tienes cuenta? <a href="<?= route('register') ?>">Regístrate</a></p>
    </main>
</body>
</html>
