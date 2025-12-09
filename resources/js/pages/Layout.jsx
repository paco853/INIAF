import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
  Box,
  Sheet,
  IconButton,
  Button,
  Snackbar,
  CircularProgress,
  Avatar,
  Typography,
  Stack,
} from '@mui/joy';
import { UserRound, LogOut } from 'lucide-react';
import MainMenu from '../components/MainMenu.jsx';
import ChangePasswordModal from './components/ChangePasswordModal.jsx';
import SplashScreen from './components/SplashScreen.jsx';

export default function Layout({ children }) {
  const { component, props } = usePage();
  const { flash, auth } = props;
  const [queue, setQueue] = React.useState([]);
  const [toast, setToast] = React.useState(null);
  const [navLoading, setNavLoading] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [splashOpen, setSplashOpen] = React.useState(true);
  const [splashStatus, setSplashStatus] = React.useState('Cargando el entorno...');
  const user = auth?.user;
  const avatarLabel = React.useMemo(() => {
    if (!user) return '?';
    const source = user.name || user.email || '';
    return source.trim().charAt(0).toUpperCase() || '?';
  }, [user]);
  const avatarImage = React.useMemo(() => {
    if (user?.avatar) {
      return user.avatar;
    }
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    const source = user?.name || user?.email || 'Usuario';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(source)}&background=0f172a&color=ffffff&size=256&bold=true`;
  }, [user]);

  React.useEffect(() => {
    const msgs = [];
    if (flash?.status) msgs.push({ color: 'success', message: flash.status });
    if (flash?.success) msgs.push({ color: 'success', message: flash.success });
    if (flash?.error) msgs.push({ color: 'danger', message: flash.error });
    if (msgs.length) setQueue((prev) => [...prev, ...msgs]);
  }, [flash]);

  React.useEffect(() => {
    if (!toast && queue.length) {
      const [next, ...rest] = queue;
      setToast(next);
      setQueue(rest);
    }
  }, [queue, toast]);

  React.useEffect(() => {
    const start = () => {
      setNavLoading(true);
      setSplashStatus('Cargando módulos...');
      setSplashOpen(true);
    };
    const finish = () => {
      setNavLoading(false);
      setSplashOpen(false);
    };
    const unStart = router.on('start', start);
    const unFinish = router.on('finish', finish);
    return () => {
      try { unStart && unStart(); } catch (_) {}
      try { unFinish && unFinish(); } catch (_) {}
    };
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  React.useEffect(() => {
    const timer = setTimeout(() => setSplashOpen(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuNavigate = React.useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove('menu-open');
      return undefined;
    }
    if (sidebarOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobile, sidebarOpen]);

  const pageSlug = React.useMemo(() => {
    if (!component) {
      return 'page';
    }
    return component.replace(/[\\/]/g, '-').toLowerCase();
  }, [component]);

  const pageClassName = React.useMemo(() => `page page--${pageSlug}`, [pageSlug]);
  const isDocumentEditPage = pageSlug === 'documentos-edit';
  const layoutRootStyle = isDocumentEditPage
    ? { backgroundImage: 'none', backgroundColor: '#eef2ff' }
    : undefined;

  React.useEffect(() => {
    if (!component) {
      document.body.removeAttribute('data-page');
      return undefined;
    }
    document.body.dataset.page = component;
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, [component]);

  return (
    <Box className="layout-root" sx={layoutRootStyle}>
        <Sheet
          variant="soft"
          color="neutral"
          sx={{
            width: isMobile ? 240 : sidebarOpen ? 260 : 50,
            minWidth: isMobile ? 240 : sidebarOpen ? 260 : 50,
            height: '100dvh',
            px: isMobile ? 2 : sidebarOpen ? 2 : 0,
            py: 2,
            borderRight: isMobile ? 'none' : '1px solid rgba(0,0,0,0.10)',
            borderColor: isMobile ? 'transparent' : 'rgba(0,0,0,0.10)',
            position: isMobile ? 'fixed' : 'sticky',
            left: 0,
            top: 0,
            backgroundColor: '#eef5ee',
            backdropFilter: 'blur(2px)',
            overflow: 'hidden',
            transition: 'transform 0.25s ease, width 0.25s ease, min-width 0.25s ease, padding 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: sidebarOpen ? 'flex-start' : 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            zIndex: isMobile ? 1300 : 'auto',
            transform: isMobile && !sidebarOpen ? 'translateX(-105%)' : 'translateX(0)',
            boxShadow: '0 0 25px rgba(0,0,0,0.07)',
          }}
        >
        {!isMobile && (
        <IconButton
          variant="outlined"
          color="neutral"
          size="sm"
          onClick={() => setSidebarOpen((prev) => !prev)}
          sx={{
            alignSelf: sidebarOpen ? 'flex-end' : 'center',
            mb: sidebarOpen ? 1.5 : 1,
          }}
        >
          =
        </IconButton>
        )}
        {sidebarOpen && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: -2,
              mb: 3,
              width: '100%',
            }}
          >
            <img src="/images/titulo.png" alt="INIAF" className="brand-image" />
          </Box>
        )}
        {sidebarOpen && <Box className="sidebar-separator" />}
        <Box className="sidebar-scrollable" sx={{ flex: 1, overflowY: 'auto', width: '100%' }}>
          <MainMenu collapsed={!sidebarOpen} onNavigate={handleMenuNavigate} user={user} />
        </Box>
        {!sidebarOpen && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <IconButton
              variant="soft"
              color="neutral"
              onClick={() => setUserModalOpen(true)}
              size="md"
            >
              <Avatar
                size="md"
                src={avatarImage}
                alt={user?.name || 'Usuario'}
                sx={{
                  width: 40,
                  height: 40,
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9)',
                }}
              >
                {avatarLabel}
              </Avatar>
            </IconButton>
          </Box>
        )}
        {sidebarOpen && (
          <Box className="sidebar-user">
            <Box className="sidebar-user__info">
              <Avatar
                variant="soft"
                color="primary"
                size="md"
                src={avatarImage}
                alt={user?.name || 'Usuario'}
              >
                <UserRound size={20} />
              </Avatar>
              <Box className="sidebar-user__text">
                <Typography level="body-sm" fontWeight="600" noWrap>
                  {user?.name || 'Usuario'}
                </Typography>
                {user?.email && (
                  <Typography level="body-xs" color="neutral" noWrap>
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <Button
              className="sidebar-user__logout"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => setChangePasswordOpen(true)}
            >
              Cambiar contraseña
            </Button>
            <Button
              className="sidebar-user__logout"
              variant="plain"
              color="danger"
              startDecorator={<LogOut size={16} />}
              fullWidth
              onClick={() => router.post('/logout')}
            >
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Sheet>
      {isMobile && sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          className="layout-overlay"
        />
      )}
      <SplashScreen open={splashOpen} status={splashStatus} />
      {userModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400,
          }}
          onClick={() => setUserModalOpen(false)}
        >
          <Sheet
            variant="soft"
            sx={{
              width: 320,
              p: 3,
              borderRadius: 2,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                variant="soft"
                sx={{ width: 40, height: 40 }}
                src={avatarImage}
                alt={user?.name || 'Usuario'}
              >
                {avatarLabel}
              </Avatar>
                <Box>
                  <Typography level="body-lg" fontWeight="600">
                    {user?.name || 'Usuario'}
                  </Typography>
                  {user?.email && (
                    <Typography level="body-sm" color="neutral.500">
                      {user.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => {
                  setChangePasswordOpen(true);
                  setUserModalOpen(false);
                }}
              >
                Cambiar contraseña
              </Button>
              <Button
                variant="plain"
                color="danger"
                fullWidth
                startDecorator={<LogOut size={16} />}
                onClick={() => router.post('/logout')}
              >
                Cerrar sesión
              </Button>
            </Stack>
          </Sheet>
        </Box>
      )}
      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            position: 'relative',
            transition: 'padding 0.25s ease',
            px: { xs: 1, md: 2 },
            pt: isDocumentEditPage ? 0 : undefined,
            backgroundColor: 'inherit',
            backgroundImage: 'url(/images/iniaf.jpg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
          className="w-full flex flex-col"
        >
        {isMobile && (
          <IconButton
            variant="soft"
            color="neutral"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: 'absolute',
              top: 12,
              left: 16,
              zIndex: 15,
              boxShadow: 'sm',
            }}
          >
            ☰
          </IconButton>
        )}
        <Box
          sx={{
            p: isDocumentEditPage ? 0 : 2,
            pt: isDocumentEditPage ? 0 : { xs: 8, md: 7 },
            position: 'relative',
            minHeight: 200,
          }}
        >
        {navLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <CircularProgress size="lg" variant="soft" />
          </Box>
        ) : (
          isDocumentEditPage ? (
            <Box
              data-page={component ?? 'page'}
              className={`${pageClassName} w-full flex flex-col`}
              sx={{ width: '100%', padding: 0 }}
            >
              {children}
            </Box>
          ) : (
            <Box
              className="layout-panel"
              sx={{
                p: { xs: 2.5, md: 3.5 },
                backgroundColor: 'transparent',
                boxShadow: 'none',
              }}
            >
              <Box data-page={component ?? 'page'} className={pageClassName}>
                {children}
              </Box>
            </Box>
          )
        )}
        </Box>
        <Snackbar
          open={!!toast}
          color={toast?.color}
          onClose={() => setToast(null)}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          variant="soft"
        >
          {toast?.message}
        </Snackbar>
      </Box>
    </Box>
  );
}
