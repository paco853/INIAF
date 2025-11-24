import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  React.useEffect(() => {
    return () => {
      reset('password');
    };
  }, [reset]);

  const handleChange = (field) => (event) => {
    const value = field === 'remember' ? event.target.checked : event.target.value;
    setData(field, value);
  };

  const submit = (event) => {
    event.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Iniciar sesión" />
      <div className="login-page">
        <main className="login-card">
          <img className="login-logo" src="/images/titulo.png" alt="INIAF" loading="lazy" />
          <h2>Iniciar sesión</h2>

          {errors.email && (
            <div className="alert">
              <div>{errors.email}</div>
            </div>
          )}

          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Correo</span>
              <div className="input-shell">
                <Mail className="input-icon" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={data.email}
                  onChange={handleChange('email')}
                  placeholder="Ingresa tu correo"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Contraseña</span>
              <div className="input-shell">
                <Lock className="input-icon" aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={data.password}
                  onChange={handleChange('password')}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={data.remember}
                onChange={handleChange('remember')}
              />
              Recordarme
            </label>
            <button type="submit" className="btn-primary" disabled={processing}>
              {processing ? 'Ingresando…' : 'Entrar'}
            </button>
          </form>

          <p className="hint">Usuario de prueba: admin@example.com / password</p>
          <p className="hint">
            ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
          </p>
        </main>
      </div>
    </>
  );
}

Login.layout = (page) => page;
