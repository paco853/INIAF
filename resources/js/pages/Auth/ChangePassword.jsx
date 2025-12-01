import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Alert } from '@mui/joy';
import '../../../css/pages/change-password.css';

export default function ChangePassword() {
  const { data, setData, post, processing, errors } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/ui/password');
  };

  return (
    <div className="change-password">
      <Head title="Cambiar contraseña" />
      <div className="change-password__card">
        <div className="change-password__header">
          <div>
            <p className="change-password__title">Cambiar contraseña</p>
            <p className="change-password__subtitle">
              Actualiza tu clave de acceso para mantener tu cuenta segura.
            </p>
          </div>
          <ShieldCheck size={28} className="change-password__icon" />
        </div>

        {(errors.current_password || errors.password) && (
          <Alert color="danger" variant="soft" sx={{ mb: 1.5 }}>
            {errors.current_password || errors.password}
          </Alert>
        )}

        <form onSubmit={submit} className="change-password__form">
          <label className="change-password__field">
            <span>Contraseña actual</span>
            <div className="change-password__input">
              <Lock size={16} />
              <input
                type="password"
                value={data.current_password}
                onChange={(e) => setData('current_password', e.target.value)}
                required
              />
            </div>
          </label>

          <label className="change-password__field">
            <span>Nueva contraseña</span>
            <div className="change-password__input">
              <Lock size={16} />
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required
              />
            </div>
          </label>

          <label className="change-password__field">
            <span>Confirmar nueva contraseña</span>
            <div className="change-password__input">
              <Lock size={16} />
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                required
              />
            </div>
          </label>

          <div className="change-password__actions">
            <Link href="/ui" className="change-password__link">
              <ArrowLeft size={16} /> Volver
            </Link>
            <button type="submit" disabled={processing}>
              {processing ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
