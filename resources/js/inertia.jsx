import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { InertiaProgress } from '@inertiajs/progress';
import Layout from './pages/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './bootstrap';
import '../css/app.css';

const lazyPages = import.meta.glob('./pages/**/*.jsx');
const eagerPages = import.meta.env.DEV
  ? import.meta.glob('./pages/**/*.jsx', { eager: true })
  : null;

function resolvePageComponent(name) {
  const key = `./pages/${name}.jsx`;

  if (import.meta.env.DEV && eagerPages) {
    const module = eagerPages[key];
    if (!module) {
      console.error(`Inertia page not found (dev eager load): ${name}`);
      throw new Error(`Inertia page not found: ${name}`);
    }
    const component = module.default ?? module;
    component.layout = component.layout || ((page) => <Layout>{page}</Layout>);
    return Promise.resolve(component);
  }

  const importer = lazyPages[key];
  if (!importer) {
    console.error(`Inertia page not found: ${name}`);
    throw new Error(`Inertia page not found: ${name}`);
  }

  return importer().then((mod) => {
    const component = mod.default ?? mod;
    component.layout = component.layout || ((page) => <Layout>{page}</Layout>);
    return component;
  });
}

createInertiaApp({
  id: 'app',
  // Use dynamic imports for pages to enable automatic code-splitting
  resolve: (name) => resolvePageComponent(name),
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(
      <CssVarsProvider defaultMode="light">
        <CssBaseline />
        <ErrorBoundary>
          <App {...props} />
        </ErrorBoundary>
      </CssVarsProvider>
    );
  },
});

InertiaProgress.init({ color: '#0ea5e9', showSpinner: false });

// Instrumentación de navegación y errores para depurar pantalla en blanco
try {
  router.events.on('start', (e) => console.debug('[Inertia] start', e?.detail ?? e));
  router.events.on('progress', (e) => console.debug('[Inertia] progress', e?.detail ?? e));
  router.events.on('finish', (e) => console.debug('[Inertia] finish', e?.detail ?? e));
  router.events.on('error', (e) => console.error('[Inertia] error', e));
  router.events.on('invalid', (e) => console.warn('[Inertia] invalid', e));

  window.addEventListener('error', (e) => {
    // eslint-disable-next-line no-console
    console.error('[window error]', e?.error || e?.message || e);
  });
  window.addEventListener('unhandledrejection', (e) => {
    // eslint-disable-next-line no-console
    console.error('[unhandledrejection]', e?.reason || e);
  });
} catch (_) {
  // noop en caso de ejecución fuera del navegador
}
