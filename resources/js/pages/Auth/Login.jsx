import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Lock } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
    remember: false,
  });

  const loginErrorMessage = errors.login || errors.username;

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

          {loginErrorMessage && (
            <div className="alert">
              <div>{loginErrorMessage}</div>
            </div>
          )}

          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Usuario</span>
              <div className="input-shell">
                <User className="input-icon" aria-hidden="true" />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={data.username}
                  onChange={handleChange('username')}
                  placeholder="Ingresa tu usuario"
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

        </main>
      </div>
    </>
  );
}

Login.layout = (page) => page;
