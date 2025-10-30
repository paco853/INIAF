<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear cuenta - Registro de Semillas</title>
    <link rel="stylesheet" href="/assets/css/auth.css">
</head>
<body class="login-body">
    <main class="login-card">
        <h1 class="login-title">REGISTRO DE SEMILLAS INIAF</h1>
        <h2 class="login-subtitle">Crear cuenta</h2>

        <?php if ($errors->any()): ?>
            <div class="alert">
                <?php foreach ($errors->all() as $error): ?>
                    <div><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?= route('register.attempt') ?>" class="form">
            <?= csrf_field() ?>
            <label class="field">
                <span>Nombre</span>
                <input type="text" name="name" value="<?= old('name') ?>" required>
            </label>
            <label class="field">
                <span>Correo</span>
                <input type="email" name="email" value="<?= old('email') ?>" required>
            </label>
            <label class="field">
                <span>Contraseña</span>
                <input type="password" name="password" required>
            </label>
            <label class="field">
                <span>Confirmar contraseña</span>
                <input type="password" name="password_confirmation" required>
            </label>
            <button type="submit" class="btn-primary">Registrarme</button>
        </form>

        <p class="hint">¿Ya tienes cuenta? <a href="<?= route('login') ?>">Inicia sesión</a></p>
    </main>
</body>
</html>

