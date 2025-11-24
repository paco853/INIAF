import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { InertiaProgress } from '@inertiajs/progress';
import Layout from './pages/Layout.jsx';
import './bootstrap';

createInertiaApp({
  id: 'app',
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
    const page = pages[`./pages/${name}.jsx`];
    page.default.layout = page.default.layout || ((p) => React.createElement(Layout, null, p));
    return page;
  },
  setup({ el, App, props }) {
    const root = createRoot(el);
    root.render(React.createElement(
      CssVarsProvider,
      { defaultMode: 'light' },
      React.createElement(CssBaseline, null),
      React.createElement(App, props),
    ));
  },
});

InertiaProgress.init({ color: '#0ea5e9', showSpinner: false });
