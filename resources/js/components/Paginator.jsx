import React from 'react';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginator({ pagination }) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const start = () => setLoading(true);
    const finish = () => setLoading(false);
    const unStart = router.on('start', start);
    const unFinish = router.on('finish', finish);
    return () => {
      try { unStart && unStart(); } catch (_) {}
      try { unFinish && unFinish(); } catch (_) {}
    };
  }, []);

  const goTo = (p) => {
    if (!p || p < 1 || p > (pagination?.last_page || 1)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(p));
    router.get(url.pathname + url.search, {}, { preserveState: true, replace: true });
  };

  return (
    <Stack direction="row" spacing={1} className="paginator">
      {loading && <CircularProgress size="sm" variant="soft" />}
      <Button
        size="md"
        variant="soft"
        color="neutral"
        disabled={!pagination?.prev_page_url}
        onClick={() => goTo((pagination?.current_page || 1) - 1)}
        className="paginator__btn paginator__btn--prev"
        startDecorator={<ChevronLeft size={16} />}
      >
        Anterior
      </Button>
      <Typography level="body-sm" className="paginator__status">
        Página {pagination?.current_page} de {pagination?.last_page}
      </Typography>
      <Button
        size="md"
        variant="soft"
        color="primary"
        disabled={!pagination?.next_page_url}
        onClick={() => goTo((pagination?.current_page || 1) + 1)}
        className="paginator__btn paginator__btn--next"
        endDecorator={<ChevronRight size={16} />}
      >
        Siguiente
      </Button>
    </Stack>
  );
}
