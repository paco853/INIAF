import React from 'react';
import { Typography, Stack, Grid } from '@mui/joy';
import { usePage } from '@inertiajs/react';
import { FileText, CheckSquare, Ban, BarChart3, Users } from 'lucide-react';
import FiltersBar from './components/FiltersBar.jsx';
import KpiGrid from './components/KpiGrid.jsx';
import WeeklySummary from './components/WeeklySummary.jsx';
import RecientesTable from './components/RecientesTable.jsx';
import DetailModal from './components/DetailModal.jsx';
import KpiPickerModal from './components/KpiPickerModal.jsx';
import CustomizeKpisModal from './components/CustomizeKpisModal.jsx';
import CultivosModal from './components/CultivosModal.jsx';
import CommunitiesModal from './components/CommunitiesModal.jsx';
import UserHistoryModal from './components/UserHistoryModal.jsx';
import KpiListModal from './components/KpiListModal.jsx';

const KPI_STORAGE_KEY = 'dashboard-selected-kpis';
const BASE_KPI_KEYS = ['totalHoy', 'certificados', 'rechazados', 'cultivos', 'comunidades'];
const ADMIN_KPI_KEY = 'usuariosHistorial';

const KPI_DEFS = {
  [ADMIN_KPI_KEY]: {
    key: ADMIN_KPI_KEY,
    label: 'Usuarios Historial',
    color: '#059669',
    iconNode: <Users size={16} />,
    iconBg: '#dcfce7',
    iconColor: '#047857',
  },
  totalHoy: {
    key: 'totalHoy',
    label: 'Total solicitudes hoy',
    color: '#2563eb',
    iconNode: <FileText size={16} />,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  certificados: {
    key: 'certificados',
    label: 'Certificados emitidos',
    color: '#10b981',
    iconNode: <CheckSquare size={16} />,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
  },
  rechazados: {
    key: 'rechazados',
    label: 'Rechazados',
    color: '#ef4444',
    iconNode: <Ban size={16} />,
    iconBg: '#ffe4e6',
    iconColor: '#e11d48',
  },
  cultivos: {
    key: 'cultivos',
    label: 'Cultivos registrados',
    color: '#8b5cf6',
    iconNode: <BarChart3 size={16} />,
    iconBg: '#eef2ff',
    iconColor: '#7c3aed',
  },
  comunidades: {
    key: 'comunidades',
    label: 'Comunidades registradas',
    color: '#0ea5e9',
    iconNode: <BarChart3 size={16} />,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
  },
};

export default function Dashboard() {
  const {
    stats = {},
    chart = [],
    recientes = [],
    cultivos = [],
    comunidades = [],
    rechazadosList = [],
    certificadosList = [],
    userHistory = [],
    auth = {},
  } = usePage().props;
  const isAdmin = Boolean(auth?.user?.is_admin);
  const normalizeText = React.useCallback((text) => (
    (text || '')
      .replace(/[“”"']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  ), []);
  const analisisPorCultivo = Array.isArray(chart) ? chart : [];
  const initialKpiKeys = isAdmin
    ? [ADMIN_KPI_KEY, ...BASE_KPI_KEYS]
    : [...BASE_KPI_KEYS];
  const [selectedKpiKeys, setSelectedKpiKeys] = React.useState(() => initialKpiKeys);
  const [activeSlice, setActiveSlice] = React.useState(null);
  const [selectedDetail, setSelectedDetail] = React.useState(null);
  const [showKpiPicker, setShowKpiPicker] = React.useState(false);
  const [showCustomize, setShowCustomize] = React.useState(false);
  const [cultivosModalOpen, setCultivosModalOpen] = React.useState(false);
  const [comunidadesModalOpen, setComunidadesModalOpen] = React.useState(false);
  const [showUserHistory, setShowUserHistory] = React.useState(false);
  const loadedKpisRef = React.useRef(false);
  const userHistoryEntries = React.useMemo(
    () => (Array.isArray(userHistory) ? userHistory : []),
    [userHistory],
  );
  const cultivosList = React.useMemo(() => {
    if (Array.isArray(cultivos) && cultivos.length > 0) {
      return cultivos;
    }
    // Fallback: construir lista desde los datos de análisis
    const seen = new Map();
    analisisPorCultivo.forEach((c) => {
      const nombre = c?.cultivo || 'Sin especie';
      const curr = seen.get(nombre) || { especie: nombre, variedades: [], validez: null, total: 0 };
      curr.total += c?.total || 0;
      seen.set(nombre, curr);
    });
    return Array.from(seen.values());
  }, [analisisPorCultivo, cultivos]);

  const totalCultivos = React.useMemo(() => cultivosList.length, [cultivosList.length]);
  const comunidadesList = React.useMemo(() => {
    if (!Array.isArray(comunidades) || comunidades.length === 0) {
      return [];
    }
    const map = new Map();
    comunidades.forEach((c) => {
      const municipio = normalizeText(c?.municipio);
      const comunidad = normalizeText(c?.comunidad);
      if (!municipio || !comunidad) return;
      const municipioNorm = municipio.toUpperCase();
      const key = `${municipioNorm}||${comunidad.toUpperCase()}`;
      if (map.has(key)) return;
      map.set(key, {
        ...c,
        municipio,
        comunidad,
        municipioNorm,
      });
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.municipioNorm === b.municipioNorm) {
        return a.comunidad.localeCompare(b.comunidad);
      }
      return a.municipioNorm.localeCompare(b.municipioNorm);
    });
  }, [comunidades, normalizeText]);
  const totalComunidades = React.useMemo(() => comunidadesList.length, [comunidadesList.length]);
  const totalMunicipios = React.useMemo(() => {
    const set = new Set();
    comunidadesList.forEach((c) => c?.municipioNorm && set.add(c.municipioNorm));
    return set.size;
  }, [comunidadesList]);
  const availableKpiKeys = React.useMemo(
    () => Object.keys(KPI_DEFS).filter((k) => {
      if (k === ADMIN_KPI_KEY && !isAdmin) {
        return false;
      }
      return !selectedKpiKeys.includes(k);
    }),
    [selectedKpiKeys, isAdmin],
  );

  React.useEffect(() => {
    if (loadedKpisRef.current) return;
    try {
      const raw = window.localStorage.getItem(KPI_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const validKeys = parsed.filter((k) => KPI_DEFS[k]);
          if (validKeys.length > 0) {
            setSelectedKpiKeys(validKeys);
          }
        }
      }
    } catch (err) {
      // noop
    } finally {
      loadedKpisRef.current = true;
    }
  }, []);

  React.useEffect(() => {
    try {
      const validKeys = selectedKpiKeys.filter((k) => KPI_DEFS[k]);
      if (validKeys.length === 0) {
        window.localStorage.removeItem(KPI_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(validKeys));
    } catch (err) {
      // noop
    }
  }, [selectedKpiKeys]);

  const [selectedCultivo, setSelectedCultivo] = React.useState('Todos');
  const [selectedMunicipio, setSelectedMunicipio] = React.useState('Todo Potosí');

  const filteredRecientes = React.useMemo(() => {
    return (recientes || []).filter((r) => {
      const matchCultivo = selectedCultivo === 'Todos' || r.especie === selectedCultivo;
      const matchMuni = selectedMunicipio === 'Todo Potosí' || r.municipio === selectedMunicipio;
      return matchCultivo && matchMuni;
    });
  }, [recientes, selectedCultivo, selectedMunicipio]);

  const [kpiList, setKpiList] = React.useState({ open: false, title: '', rows: [] });

  const handleOpenKpiList = React.useCallback((key) => {
    if (!key) return;
    if (key === 'rechazados') {
      setKpiList({
        open: true,
        title: 'Rechazados',
        rows: rechazadosList,
      });
      return;
    }
    if (key === 'certificados') {
      setKpiList({
        open: true,
        title: 'Certificados emitidos',
        rows: certificadosList,
      });
    }
  }, [rechazadosList, certificadosList]);

  const kpis = React.useMemo(() => {
    const valuesMap = {
      usuariosHistorial: stats.userHistoryCount ?? userHistoryEntries.length,
      totalHoy: stats.totalHoy ?? 0,
      certificados: stats.certificados ?? 0,
      rechazados: stats.rechazados ?? 0,
      cultivos: totalCultivos,
      comunidades: totalComunidades,
    };

    const cards = selectedKpiKeys.map((key) => {
      if (key === ADMIN_KPI_KEY && !isAdmin) {
        return null;
      }
      const def = KPI_DEFS[key];
      if (!def) return null;
      const onClick = key === 'usuariosHistorial'
        ? () => setShowUserHistory(true)
        : key === 'cultivos'
          ? () => setCultivosModalOpen(true)
          : key === 'comunidades'
            ? () => setComunidadesModalOpen(true)
            : key === 'rechazados'
              ? () => handleOpenKpiList('rechazados')
              : key === 'certificados'
                ? () => handleOpenKpiList('certificados')
                : undefined;
      return {
        ...def,
        value: valuesMap[key] ?? 0,
        onClick,
        subtitle: key === 'usuariosHistorial' ? 'Historial activo' : def.subtitle,
      };
    }).filter(Boolean);

    return cards;
  }, [selectedKpiKeys, stats, totalCultivos, availableKpiKeys, isAdmin, handleOpenKpiList]);

  const handleAddKpi = (key) => {
    if (!key) return;
    setSelectedKpiKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setShowKpiPicker(false);
  };

  const cultivoOptions = React.useMemo(() => {
    const set = new Set();
    analisisPorCultivo.forEach((c) => c?.cultivo && set.add(c.cultivo));
    recientes.forEach((r) => r?.especie && set.add(r.especie));
    return ['Todos', ...Array.from(set)];
  }, [analisisPorCultivo, recientes]);

  const municipioOptions = React.useMemo(() => {
    const set = new Set();
    recientes.forEach((r) => r?.municipio && r.municipio !== '-' && set.add(r.municipio));
    return ['Todo Potosí', ...Array.from(set)];
  }, [recientes]);

  const filteredChart = React.useMemo(() => {
    if (selectedCultivo === 'Todos') return analisisPorCultivo;
    return analisisPorCultivo.filter((c) => c.cultivo === selectedCultivo);
  }, [analisisPorCultivo, selectedCultivo]);

  const chartColors = React.useMemo(() => {
    const base = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    const count = Math.max(filteredChart.length, base.length);
    const colors = [];
    for (let i = 0; i < count; i += 1) {
      if (base[i]) {
        colors.push(base[i]);
        continue;
      }
      const hue = (i * 137.508) % 360; // espaciado dorado para diferenciación
      colors.push(`hsl(${hue} 70% 55%)`);
    }
    return colors;
  }, [filteredChart.length]);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography level="body-sm" color="neutral">Inicio</Typography>
        <Typography level="body-sm" color="neutral">›</Typography>
        <Typography level="body-sm" fontWeight="600">Dashboard</Typography>
      </Stack>
      <Typography level="h3">Dashboard</Typography>

      <FiltersBar
        selectedCultivo={selectedCultivo}
        selectedMunicipio={selectedMunicipio}
        cultivoOptions={cultivoOptions}
        municipioOptions={municipioOptions}
        onCultivoChange={setSelectedCultivo}
        onMunicipioChange={setSelectedMunicipio}
        onCustomize={() => setShowCustomize(true)}
      />

      <Grid container spacing={2} alignItems="stretch">
        <Grid xs={12} md={8}>
          <KpiGrid items={kpis} />
        </Grid>
        <Grid xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
          <WeeklySummary
            data={filteredChart}
            colors={chartColors}
            activeSlice={activeSlice}
            setActiveSlice={setActiveSlice}
          />
        </Grid>
      </Grid>

      <RecientesTable rows={Array.isArray(filteredRecientes) ? filteredRecientes : []} onSelect={setSelectedDetail} />

      <DetailModal detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
      <KpiPickerModal
        open={showKpiPicker}
        onClose={() => setShowKpiPicker(false)}
        options={availableKpiKeys.map((key) => KPI_DEFS[key]).filter(Boolean)}
        onSelect={handleAddKpi}
      />
      <CustomizeKpisModal
        open={showCustomize}
        onClose={() => setShowCustomize(false)}
        kpiDefs={Object.values(KPI_DEFS)}
        selectedKeys={selectedKpiKeys}
        onSave={setSelectedKpiKeys}
      />
      <UserHistoryModal open={showUserHistory} onClose={() => setShowUserHistory(false)} entries={userHistoryEntries} />
      <CultivosModal
        open={cultivosModalOpen}
        onClose={() => setCultivosModalOpen(false)}
        cultivos={cultivosList}
      />
      <CommunitiesModal
        open={comunidadesModalOpen}
        onClose={() => setComunidadesModalOpen(false)}
        comunidades={comunidadesList}
        municipiosCount={totalMunicipios}
      />
      <KpiListModal
        open={kpiList.open}
        title={kpiList.title}
        rows={kpiList.rows}
        onClose={() => setKpiList({ open: false, title: '', rows: [] })}
      />
    </Stack>
  );
}
