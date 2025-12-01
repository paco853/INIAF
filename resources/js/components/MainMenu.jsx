import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import {
  Home,
  ClipboardList,
  FileText,
  Settings,
  Sprout,
  Leaf,
  Database,
  ShieldCheck,
  Users,
} from 'lucide-react';
import '../../css/pages/modules/menu.css';

const useActiveMatcher = () => {
  const { url } = usePage();
  return React.useCallback(
    (match) => {
      if (!match) return false;
      return url === match || url.startsWith(`${match}/`);
    },
    [url]
  );
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

const MainLink = ({ href, icon, label, active, showLabel, onNavigate }) => (
  <ListItem className="main-menu__item">
    <ListItemButton
      component={Link}
      href={href}
      preserveScroll
      onClick={onNavigate}
      className={cx('menu-link', active && 'menu-link--active')}
    >
      <ListItemDecorator className={cx('menu-link__icon', active && 'menu-link__icon--active')}>
        {icon}
      </ListItemDecorator>
      {showLabel && label}
    </ListItemButton>
  </ListItem>
);

const SubLink = ({ href, label, active, icon, onNavigate, className }) => (
  <ListItem className="main-menu__item">
    <ListItemButton
      component={Link}
      href={href}
      preserveScroll
      onClick={onNavigate}
      className={cx('menu-sublink', className, active && 'menu-sublink--active')}
    >
      {icon && (
        <Box className={cx('menu-sublink__icon', active && 'menu-sublink__icon--active')}>
          {icon}
        </Box>
      )}
      {label}
    </ListItemButton>
  </ListItem>
);

export default function MainMenu({ collapsed = false, onNavigate, user }) {
  const isActive = useActiveMatcher();
  const [configOpen, setConfigOpen] = React.useState(false);
  const isAdmin = React.useMemo(() => {
    const rawRole = (user?.role || user?.perfil || '').toString().toLowerCase();
    const flag = user?.is_admin === true || user?.admin === true || rawRole === 'admin';
    return Boolean(flag);
  }, [user]);
  const configActive = [
    '/ui/cultivos',
    '/ui/variedades',
    '/ui/backups',
    ...(isAdmin ? ['/ui/roles-permisos', '/ui/usuarios'] : []),
  ].some(isActive);
  const showConfig = configOpen || configActive;

  React.useEffect(() => {
    if (configActive) {
      setConfigOpen(true);
    }
  }, [configActive]);

  const toggleConfig = () => setConfigOpen((prev) => !prev);
  const showLabels = true;

  if (collapsed) {
    return null;
  }

  return (
    <Box className="main-menu">
      <List className="main-menu__primary-list">
        <MainLink
          href="/ui"
          icon={<Home size={22} />}
          label="Inicio"
          active={isActive('/ui')}
          onNavigate={onNavigate}
          showLabel={showLabels}
        />
        <MainLink
          href="/ui/analisis/semillas"
          icon={<ClipboardList size={22} />}
          label="Registro de Análisis de Semillas"
          active={isActive('/ui/analisis')}
          onNavigate={onNavigate}
          showLabel={showLabels}
        />
        <MainLink
          href="/ui/documentos"
          icon={<FileText size={22} />}
          label="Documento"
          active={isActive('/ui/documentos')}
          onNavigate={onNavigate}
          showLabel={showLabels}
        />
      </List>

      <Box
        onMouseEnter={() => setConfigOpen(true)}
        onMouseLeave={() => setConfigOpen(false)}
        className="main-menu__config-wrapper"
      >
        <List className="main-menu__config-list">
          <ListItem className="main-menu__item">
            <ListItemButton
              className={cx(
                'menu-config-toggle',
                showConfig && 'menu-config-toggle--active'
              )}
              onFocus={() => setConfigOpen(true)}
              onClick={toggleConfig}
            >
              <ListItemDecorator className="menu-sublink__icon">
                <Settings size={22} />
              </ListItemDecorator>
              Configuración
            </ListItemButton>
          </ListItem>
          <List
            className={cx('main-menu__sublist', showConfig && 'is-open')}
            sx={{ display: showConfig ? 'flex' : 'none' }}
          >
            <Typography level="body-xs" className="main-menu__subtitle">
              CULTIVOS
            </Typography>
            <SubLink
              href="/ui/cultivos"
              label="Cultivos"
              active={isActive('/ui/cultivos')}
              onNavigate={onNavigate}
              icon={<Sprout size={18} />}
            />
            <SubLink
              href="/ui/variedades"
              label="Variedades"
              active={isActive('/ui/variedades')}
              onNavigate={onNavigate}
              icon={<Leaf size={18} />}
            />
            <Typography level="body-xs" className="main-menu__subtitle">
              SISTEMA
            </Typography>
            <SubLink
              href="/ui/backups"
              label="Copias de Seguridad"
              active={isActive('/ui/backups')}
              onNavigate={onNavigate}
              icon={<Database size={18} />}
              className="menu-sublink--system"
            />
            {isAdmin && (
              <>
                <SubLink
                  href="/ui/roles-permisos"
                  label="Roles y Permisos"
                  active={isActive('/ui/roles-permisos')}
                  onNavigate={onNavigate}
                  icon={<ShieldCheck size={18} />}
                  className="menu-sublink--system"
                />
                <SubLink
                  href="/ui/usuarios"
                  label="Usuarios"
                  active={isActive('/ui/usuarios')}
                  onNavigate={onNavigate}
                  icon={<Users size={18} />}
                  className="menu-sublink--system"
                />
              </>
            )}
          </List>
        </List>
      </Box>
    </Box>
  );
}
