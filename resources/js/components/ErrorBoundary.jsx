import React from 'react';
import { router } from '@inertiajs/react';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log detallado para depuración
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] UI error:', error, info);
  }

  handleRetry = () => {
    try {
      router.reload({ preserveScroll: true });
    } catch (_) {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <Sheet variant="soft" sx={{ m: 2, p: 2 }}>
          <Typography level="h4" sx={{ mb: 1 }}>Ocurrió un error al renderizar</Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            {String(error?.message ?? error)}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={this.handleRetry} variant="solid">Reintentar</Button>
            <Button onClick={() => window.location.reload()} variant="outlined" color="neutral">Recargar</Button>
          </Stack>
        </Sheet>
      );
    }
    return this.props.children;
  }
}

