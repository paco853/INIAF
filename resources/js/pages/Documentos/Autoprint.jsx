import React from 'react';
import { router, usePage } from '@inertiajs/react';
import {
  Box,
  Button,
  Sheet,
  Stack,
  Typography,
  Alert,
} from '@mui/joy';

export default function DocumentoAutoprint() {
  const { props } = usePage();
  const { inlineUrl, downloadUrl, backUrl, flash } = props;
  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    const handleLoad = () => {
      try {
        setTimeout(() => {
          if (frame.contentWindow) {
            frame.contentWindow.focus();
            frame.contentWindow.print();
          }
        }, 300);
      } catch (e) {
        // silencioso
      }
    };

    frame.addEventListener('load', handleLoad);
    return () => frame.removeEventListener('load', handleLoad);
  }, []);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}
      >
        <Box>
          <Typography level="h4" sx={{ fontWeight: 600 }}>Imprimir documento</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            El documento se abre en vista previa y se envía automáticamente a imprimir.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => router.visit(backUrl || '/ui/documentos')}
          >
            Volver
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="primary"
            component="a"
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
          >
            Descargar PDF
          </Button>
        </Stack>
      </Stack>

      {flash?.error && (
        <Alert color="danger" variant="soft">
          {flash.error}
        </Alert>
      )}

      <Sheet
        variant="soft"
        sx={{
          borderRadius: 18,
          boxShadow: 'lg',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          minHeight: 400,
        }}
      >
        <Box
          sx={{
            height: { xs: '70vh', md: '80vh' },
            backgroundColor: 'neutral.50',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            src={`${inlineUrl}#toolbar=0`}
            title="Vista previa PDF"
            className="iframe-full"
          />
        </Box>
      </Sheet>
    </Stack>
  );
}
