import React, { useMemo, useState, useEffect } from 'react';
import { Box, Alert, Stack } from '@mui/joy';
import Paginator from '../../components/Paginator.jsx';
import { router, usePage } from '@inertiajs/react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

import DocumentosHeader from './DocumentosHeader';
import DocumentosCharts from './DocumentosCharts';
import DocumentosFilters from './DocumentosFilters';
import DocumentosTable from './DocumentosTable';
import DownloadModal from './DownloadModal';

ChartJS.register(ArcElement, ChartTooltip, Legend);

export default function Documentos() {
  const { props } = usePage();
  const {
    docs,
    docsAll = [],
    flash,
    filters = {},
    speciesOptions = [],
  } = props;

  const [deletingId, setDeletingId] = React.useState(null);
  const printFrameRef = React.useRef(null);

  const [animateCharts, setAnimateCharts] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const [downloadModalOpen, setDownloadModalOpen] = React.useState(false);
  const [downloadForm, setDownloadForm] = React.useState({
    modo: 'nlab',
    desde: '',
    hasta: '',
  });
  const [showCharts, setShowCharts] = useState(true);
  const [downloadError, setDownloadError] = React.useState('');

  const [filterState, setFilterState] = React.useState({
    anio: filters?.anio ?? '',
    nlab: filters?.nlab ?? '',
    especie: filters?.especie ?? '',
    estado: filters?.estado ?? '',
  });

  React.useEffect(() => {
    setFilterState({
      anio: filters?.anio ?? '',
      nlab: filters?.nlab ?? '',
      especie: filters?.especie ?? '',
      estado: filters?.estado ?? '',
    });
  }, [filters]);

  const handleFilterChange = React.useCallback((key) => (event) => {
    const value = event.target.value;
    setFilterState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleYearChange = React.useCallback((event) => {
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setFilterState((prev) => ({ ...prev, anio: value }));
  }, []);

  const applyFilters = React.useCallback((nextState = filterState) => {
    const payload = Object.fromEntries(
      Object.entries(nextState).filter(([, value]) => value != null && value !== ''),
    );
    router.get('/ui/documentos', payload, { preserveState: true, replace: true });
  }, [filterState, router]);

  const handleEstadoChange = React.useCallback((_, value) => {
    const next = value === 'ALL' ? '' : (value ?? '');
    const nextState = { ...filterState, estado: next };
    setFilterState(nextState);
    applyFilters(nextState);
  }, [filterState, applyFilters]);

  const handleEspecieSelect = React.useCallback((_, value) => {
    const next = value === 'ALL' ? '' : (value ?? '');
    const nextState = { ...filterState, especie: next };
    setFilterState(nextState);
    applyFilters(nextState);
  }, [filterState, applyFilters]);

  const handleFilterSubmit = React.useCallback((event) => {
    event.preventDefault();
    applyFilters(filterState);
  }, [applyFilters, filterState]);

  const clearFilters = React.useCallback(() => {
    const empty = {
      anio: '',
      nlab: '',
      especie: '',
      estado: '',
    };
    setFilterState(empty);
    router.get('/ui/documentos', {}, { preserveState: true, replace: true });
  }, [router]);

  // --------- RESUMEN ESTADO ----------
  const statusSummary = useMemo(() => {
    const items = Array.isArray(docsAll) ? docsAll : [];
    const summary = items.reduce(
      (acc, doc) => {
        const status = (doc.estado || 'Pendiente').toLowerCase();
        if (status.includes('apro')) {
          acc.aprobado += 1;
        } else if (status.includes('rech')) {
          acc.rechazado += 1;
        } else {
          acc.otro += 1;
        }
        return acc;
      },
      { aprobado: 0, rechazado: 0, otro: 0 },
    );
    const total = summary.aprobado + summary.rechazado + summary.otro;
    return {
      ...summary,
      total,
      aprobadoPercent: total ? Math.round((summary.aprobado / total) * 100) : 0,
      rechazadoPercent: total ? Math.round((summary.rechazado / total) * 100) : 0,
    };
  }, [docsAll]);

  const chartData = useMemo(() => ({
    labels: ['Aprobados', 'Rechazados'],
    datasets: [
      {
        data: [statusSummary.aprobado, statusSummary.rechazado],
        backgroundColor: ['#34c759', '#f24d4d'],
        hoverBackgroundColor: ['#2ecc71', '#ff5f5f'],
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }), [statusSummary]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
      legend: { display: false },
    },
  }), []);

  // --------- ESPECIES (DONUT) ----------
  const speciesPalette = ['#1d4ed8', '#0ea5e9', '#22d3ee', '#a855f7', '#f472b6', '#f97316'];

  const speciesData = useMemo(() => {
    const counts = (Array.isArray(docsAll) ? docsAll : []).reduce((acc, doc) => {
      const name = doc.especie || 'Sin info';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts || {})
      .sort((a, b) => b[1] - a[1]); // 🔥 sin slice: muestra TODAS las especies

    return sorted.map(([name, value], index) => ({
      name,
      value,
      color: speciesPalette[index % speciesPalette.length],
    }));
  }, [docsAll]);

  const [hoveredSpecies, setHoveredSpecies] = useState(null);
  const selectedSpecies = hoveredSpecies ?? speciesData[0] ?? null;

  const handleSpeciesHover = React.useCallback((_, elements) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      setHoveredSpecies(speciesData[index] ?? null);
      return;
    }
    setHoveredSpecies(null);
  }, [speciesData]);

  const speciesDonutData = useMemo(() => ({
    labels: speciesData.map((item) => item.name),
    datasets: [
      {
        data: speciesData.map((item) => item.value),
        backgroundColor: speciesData.map((item) => item.color),
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  }), [speciesData]);

  const speciesDonutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          title: (items) => (items[0]?.label ? `ESPECIE: ${items[0].label}` : ''),
          label: (item) => `CANTIDAD: ${item.raw ?? 0}`,
        },
      },
      legend: { display: false },
    },
  }), []);

  const totalDocuments = Array.isArray(docsAll) ? docsAll.length : 0;

  // --------- ACCIONES TABLA ----------
  const onDelete = async (id) => {
    if (!confirm('¿Desea eliminar este documento?')) return;
    setDeletingId(id);
    router.delete(`/documentos/${id}`, {
      preserveScroll: true,
      onFinish: () => setDeletingId(null),
    });
  };

  const renderEstadoBadge = (estado) => {
    const normalized = String(estado || '').toLowerCase();
    const modifier = normalized === 'aprobado' || normalized === 'finalizado'
      ? 'estado-badge--aprobado'
      : normalized === 'rechazado'
        ? 'estado-badge--rechazado'
        : 'estado-badge--pendiente';
    return (
      <Box component="span" className={`estado-badge ${modifier}`}>
        {estado || 'Pendiente'}
      </Box>
    );
  };

  const handlePrint = React.useCallback((docId) => {
    const frame = printFrameRef.current;
    if (!frame || !docId) return;
    const src = `/documentos/${docId}/imprimir?inline=1`;
    const onLoad = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } catch (e) {
        console.warn('print preview error', e);
      } finally {
        frame.removeEventListener('load', onLoad);
      }
    };
    frame.addEventListener('load', onLoad);
    frame.src = `${src}#toolbar=0`;
  }, []);

  const handleWordDownload = React.useCallback((docId) => {
    if (!docId) return;
    const url = `/documentos/${docId}/word`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
  }, []);

  const handleDownloadChange = React.useCallback(
    (field) => (event, valueProp) => {
      const value = typeof valueProp === 'string' ? valueProp : event?.target?.value ?? '';
      setDownloadForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleBulkDownload = React.useCallback(
    (event) => {
      event.preventDefault();
      const { modo, desde, hasta } = downloadForm;
      if (!modo || !desde || !hasta) {
        setDownloadError('Completa los tres campos para continuar.');
        return;
      }
      const params = new URLSearchParams({ modo, desde, hasta });
      const url = `/documentos/descarga-general?${params.toString()}`;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
      setDownloadModalOpen(false);
      setDownloadError('');
    },
    [downloadForm],
  );

  // --------- RENDER ----------
  return (
    <Stack spacing={3} sx={{ pb: 3 }}>
      <DocumentosHeader
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts((prev) => !prev)}
        onOpenDownload={() => setDownloadModalOpen(true)}
      />

      {showCharts && (
        <DocumentosCharts
          totalDocuments={totalDocuments}
          chartData={chartData}
          chartOptions={chartOptions}
          speciesData={speciesData}
          speciesDonutData={speciesDonutData}
          speciesDonutOptions={speciesDonutOptions}
          onSpeciesHover={handleSpeciesHover}
        />
      )}

      {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
      {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}

      <DocumentosFilters
        filterState={filterState}
        speciesOptions={speciesOptions}
        onYearChange={handleYearChange}
        onFilterChange={handleFilterChange}
        onEspecieChange={handleEspecieSelect}
        onEstadoChange={handleEstadoChange}
        onSubmit={handleFilterSubmit}
        onClear={clearFilters}
      />

      <DownloadModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        downloadForm={downloadForm}
        onChangeField={handleDownloadChange}
        onSubmit={handleBulkDownload}
        error={downloadError}
      />

      <Box
        component="iframe"
        ref={printFrameRef}
        title="print-frame"
        sx={{
          width: 0,
          height: 0,
          border: 0,
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <DocumentosTable
        docs={docs}
        onDelete={onDelete}
        onPrint={handlePrint}
        renderEstadoBadge={renderEstadoBadge}
        deletingId={deletingId}
      />

      <Paginator pagination={docs} />
    </Stack>
  );
}
