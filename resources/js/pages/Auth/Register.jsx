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
      <Head title="Registrar Nuevo Usuario" />
      <div className="login-page">
        <main className="login-card register-card">
          <button
            type="button"
            className="register-card__close"
            onClick={() => window.history.back()}
            aria-label="Cerrar"
          >
            ×
          </button>
          <img className="login-logo" src="/images/titulo.png" alt="INIAF" loading="lazy" />
          <h2>Registrar Nuevo Usuario</h2>
          <p className="register-card__subtitle">
            Ingresa los datos para crear una nueva cuenta.
          </p>

          {errorList.length > 0 && (
            <div className="alert">
              {errorList.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          )}

          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Nombre completo</span>
              <div className="input-shell">
                <User className="input-icon" aria-hidden="true" />
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange('name')}
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </label>
            <label className="field">
              <span>Correo electrónico</span>
              <div className="input-shell">
                <Mail className="input-icon" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange('email')}
                  placeholder="nombre@iniag.gob.bo"
                  required
                />
              </div>
            </label>
            <div className="register-card__grid">
              <label className="field">
                <span>Contraseña</span>
                <div className="input-shell">
                  <Lock className="input-icon" aria-hidden="true" />
                  <input
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={handleChange('password')}
                    placeholder="Contraseña"
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
                    placeholder="Confirmar"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="register-card__actions">
              <Link href="/login" className="btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn-primary" disabled={processing}>
                {processing ? 'Creando usuario…' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

Register.layout = (page) => page;
