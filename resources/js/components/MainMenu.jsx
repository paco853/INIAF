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
  CheckCircle,
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

const SubLink = ({ href, label, active, icon, onNavigate }) => (
  <ListItem className="main-menu__item">
    <ListItemButton
      component={Link}
      href={href}
      preserveScroll
      onClick={onNavigate}
      className={cx('menu-sublink', active && 'menu-sublink--active')}
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

export default function MainMenu({ collapsed = false, onNavigate }) {
  const isActive = useActiveMatcher();
  const [configOpen, setConfigOpen] = React.useState(false);
  const configActive = ['/ui/cultivos', '/ui/variedades', '/ui/validez'].some(isActive);
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
            <SubLink
              href="/ui/validez"
              label="Validez de Análisis"
              active={isActive('/ui/validez')}
              onNavigate={onNavigate}
              icon={<CheckCircle size={18} />}
            />
          </List>
        </List>
      </Box>
    </Box>
  );
}
