import React from 'react';
import { Lock, User } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function AdminLoginModal({ open, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    password: '',
    admin_modal: true,
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleChange = (field) => (event) => {
    setData(field, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    post('/admin/login', {
      preserveScroll: true,
      preserveState: true,
      onSuccess: onClose,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__backdrop" onClick={onClose} />
      <main className="login-card admin-modal__content" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <img className="login-logo" src="/images/titulo.png" alt="INIAF" loading="lazy" />
        <h2>Modo administrador</h2>
        <p className="hint">Ingresa los datos del administrador para continuar.</p>
        {(errors.admin_login) && (
          <div className="alert">
            <div>{errors.admin_login}</div>
          </div>
        )}
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Usuario</span>
            <div className="input-shell">
              <User className="input-icon" aria-hidden="true" />
              <input
                name="username"
                type="text"
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
                name="password"
                type="password"
                value={data.password}
                onChange={handleChange('password')}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
          </label>
          <button type="submit" className="btn-primary" disabled={processing}>
            {processing ? 'Ingresando…' : 'Entrar como admin'}
          </button>
        </form>
      </main>
    </div>
  );
}
