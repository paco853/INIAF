import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  React.useEffect(() => {
    return () => {
      reset('password', 'password_confirmation');
    };
  }, [reset]);

  const handleChange = (field) => (event) => {
    setData(field, event.target.value);
  };

  const submit = (event) => {
    event.preventDefault();
    post('/register');
  };

  const errorList = Object.values(errors);

  return (
    <>
      <Head title="Crear cuenta" />
      <div className="login-page">
        <main className="login-card">
          <img className="login-logo" src="/images/titulo.png" alt="INIAF" loading="lazy" />
          <h2>Crear cuenta</h2>

          {errorList.length > 0 && (
            <div className="alert">
              {errorList.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          )}

          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Nombre</span>
              <div className="input-shell">
                <User className="input-icon" aria-hidden="true" />
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange('name')}
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Correo</span>
              <div className="input-shell">
                <Mail className="input-icon" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
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
                  value={data.password}
                  onChange={handleChange('password')}
                  placeholder="Crea una contraseña"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Confirmar contraseña</span>
              <div className="input-shell">
                <Lock className="input-icon" aria-hidden="true" />
                <input
                  type="password"
                  name="password_confirmation"
                  value={data.password_confirmation}
                  onChange={handleChange('password_confirmation')}
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </label>
            <button type="submit" className="btn-primary" disabled={processing}>
              {processing ? 'Registrando…' : 'Registrarme'}
            </button>
          </form>

          <p className="hint">
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </main>
      </div>
    </>
  );
}

Register.layout = (page) => page;
