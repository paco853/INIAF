import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import {
  Stack,
  Typography,
  Button,
  Modal,
  ModalDialog,
} from '@mui/joy';
import TableFormInput, { TableFormSelect } from './components/TableFormInput';
import { Hash, Sprout, CalendarDays, Handshake, Shield, Clock, Scale, Package, Thermometer, Activity } from 'lucide-react';
import useDocumentoForm from './hooks/useDocumentoForm';

const numberInputSlotProps = {
  input: {
    sx: {
      '&::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      MozAppearance: 'textfield',
    },
    onWheel: (event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        target.blur();
      }
    },
  },
};

const accentBorderClass = 'border border-[1.5px] border-slate-300';
const cellLabelClass = `${accentBorderClass} px-3 py-2 h-[48px] text-[13px] font-semibold uppercase tracking-wide text-green-900/80 align-middle leading-tight bg-white/50 backdrop-blur-xl`;
const cellValueClass = `${accentBorderClass} px-3 py-2 h-[48px] text-[14px] font-semibold text-gray-700 align-middle leading-tight bg-white/50 backdrop-blur-xl`;
const sectionHeaderClass = 'bg-[rgba(16,118,61,0.9)] text-white text-[0.65rem] uppercase tracking-[0.35em] px-4 py-3 font-semibold leading-none border border-[rgba(16,118,61,0.9)] border-b-0';

const renderSectionHeader = (title) => (
  <tr>
    <td colSpan={4} className={sectionHeaderClass}>
      {title}
    </td>
  </tr>
);

const renderRow = (labelA, contentA, labelB, contentB, rowClass = '') => (
  <tr className={`bg-white/10 ${rowClass}`}>
    <td className={cellLabelClass}>{labelA}</td>
    <td className={cellValueClass}>{contentA}</td>
    <td className={cellLabelClass}>{labelB}</td>
    <td className={`${cellValueClass} pr-0`}>{contentB}</td>
  </tr>
);

const renderFullRow = (label, content, rowClass = '') => (
  <tr className={`bg-white/10 ${rowClass}`}>
    <td className={cellLabelClass}>{label}</td>
    <td className={`${cellValueClass} pr-0`} colSpan={3}>
      {content}
    </td>
  </tr>
);

const analysisLabelClass = `${accentBorderClass} px-3 py-2 h-[42px] text-[13px] font-semibold uppercase tracking-[0.25em] text-green-900/80 align-middle leading-tight bg-white/50 backdrop-blur-xl`;
const analysisValueClass = `${accentBorderClass} px-3 py-2 h-[42px] text-[14px] font-semibold text-gray-700 align-middle leading-tight bg-white/50 backdrop-blur-xl`;
const renderAnalysisBreakdownRow = (label, pct, onPct, pctError, kg, onKg, kgError, highlight = '') => {
  const isDanger = highlight === 'danger';
  const labelClasses = `${analysisLabelClass} ${isDanger ? 'text-red-600' : ''}`;
  const valueClasses = `${analysisValueClass} ${isDanger ? 'text-red-600' : ''}`;
  const rowClass = isDanger ? 'bg-red-50 border border-red-200' : 'bg-white/10';
  return (
    <tr className={rowClass}>
      <td className={labelClasses}>{label}</td>
      <td className={valueClasses}>
        <TableFormInput
          type="number"
          value={pct}
          onChange={onPct}
          startDecorator={<Scale size={16} />}
          error={pctError}
          slotProps={numberInputSlotProps}
        />
      </td>
      <td className={valueClasses}>
        <TableFormInput
          type="number"
          value={kg}
          onChange={onKg}
          startDecorator={<Scale size={16} />}
          error={kgError}
          slotProps={numberInputSlotProps}
        />
      </td>
    </tr>
  );
};

export default function DocumentoEdit() {
  const { props } = usePage();
  const {
    doc = {},
    flash,
    loteSuggestions = [],
    cultivos = [],
  } = props;

  const {
    data,
    errors,
    processing,
    submit,
    showMissingModal,
    setShowMissingModal,
    missingMessage,
    serverErrors,
    hasMissingRequired,
    nlabFieldError,
    nlabClientError,
    checkingNlab,
    lotes,
    especiesOptions,
    categoriaInicialOptions,
    categoriaFinalOptions,
    variedadOptions,
    totalKg,
    estadoValue,
    handleUpperChange,
    handleUpperWithSpacesChange,
    handleUpperNoTrimChange,
    handlePlainChange,
    handleVariedadSelect,
    handleEspecieSelect,
    validezDays,
    handleValidezDaysChange,
    handleObservacionesChange,
    handleAnioChange,
    handleTextareaInput,
    handleEstadoChange,
    handleLoteManualChange,
  } = useDocumentoForm({ doc, loteSuggestions, cultivos });

  const [comunidadSuggestions, setComunidadSuggestions] = React.useState([]);
  const [municipioSuggestions, setMunicipioSuggestions] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch('/comunidades/suggest', {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        if (!active) {
          return;
        }
        const rows = Array.isArray(payload?.comunidades) ? payload.comunidades : [];
        const comunidadSet = new Set();
        const municipioSet = new Set();
        rows.forEach((row) => {
          const comunidadValue = (row?.comunidad ?? '').toString().trim().toUpperCase();
          const municipioValue = (row?.municipio ?? '').toString().trim().toUpperCase();
          if (comunidadValue) {
            comunidadSet.add(comunidadValue);
          }
          if (municipioValue) {
            municipioSet.add(municipioValue);
          }
        });
        setComunidadSuggestions(Array.from(comunidadSet).sort((a, b) => a.localeCompare(b)));
        setMunicipioSuggestions(Array.from(municipioSet).sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const conclusionRadioOptions = [
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
  ];

  const textareaBaseClass = 'w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-900 focus:outline-none resize-none';

  const conclusionDictamenContent = (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-4">
        {conclusionRadioOptions.map(({ value, label }) => (
          <label
            key={value}
            className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-slate-500"
          >
            <input
              type="radio"
              name="estado"
              value={value}
              checked={estadoValue === value}
              onChange={handleEstadoChange}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-[0.75rem] text-slate-900 font-semibold">{label}</span>
          </label>
        ))}
      </div>
      {errors.estado && (
        <p className="text-[0.65rem] text-rose-600">{errors.estado}</p>
      )}
    </div>
  );

  const conclusionValidezContent = (
    <div className="flex flex-col gap-1">
      <input
        type="number"
        min={0}
        value={validezDays ?? ''}
        onChange={(event) => handleValidezDaysChange(event.target.value)}
        className={`${textareaBaseClass} min-h-[48px]`}
      />
      {errors.validez && (
        <p className="text-[0.65rem] text-rose-600">{errors.validez}</p>
      )}
    </div>
  );

  const renderTextareaField = (value, changeHandler, error) => (
    <div className="flex flex-col gap-1">
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={changeHandler}
        onInput={handleTextareaInput}
        className={`${textareaBaseClass} min-h-[96px]`}
      />
      {error && (
        <p className="text-[0.65rem] text-rose-600">{error}</p>
      )}
    </div>
  );

  return (
    <div className="w-full flex justify-center bg-transparent px-4 py-6">
  <form
    onSubmit={submit}
    noValidate
    className="w-full max-w-[1200px] rounded-[34px] bg-transparent shadow-[0_30px_70px_rgba(15,23,42,0.18)] border border-white/30 overflow-hidden backdrop-blur"
  >
    <div className="w-full bg-[rgba(22,160,61,0.9)] px-4 py-3">
          <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                <Sprout size={20} />
              </div>
              <div>
                <p className="text-[0.75rem] font-semibold text-sky-200">Control de Calidad</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                component={Link}
                href="/ui/documentos"
                className="w-full border border-gray-200 bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 rounded-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="solid"
                className="px-6 py-2 text-sm font-semibold bg-[#15803D] hover:bg-[#166534] text-white rounded-none"
                disabled={processing || checkingNlab}
              >
                {checkingNlab ? 'Validando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
        <datalist id="lote-suggestions">
          {lotes.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
        <datalist id="documento-categorias-finales">
          {categoriaFinalOptions.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
        <datalist id="documento-categorias-iniciales">
          {categoriaInicialOptions.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
        <datalist id="documento-comunidades">
          {comunidadSuggestions.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
        <datalist id="documento-municipios">
          {municipioSuggestions.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>

        <div className="overflow-x-auto bg-transparent w-full mx-0">
          <table className="w-full border border-[1.5px] border-slate-300 border-collapse text-sm bg-transparent">
              <tbody>
                  {renderSectionHeader('1. Identificación y origen')}
                  {renderFullRow(
                    'Año',
                    <TableFormInput
                      type="number"
                      min="0"
                      step="1"
                      value={data.anio}
                      onChange={handleAnioChange}
                      startDecorator={<Clock size={16} />}
                      error={errors.anio}
                    />
                  )}
                  {renderRow(
                    'N° laboratorio',
                    <TableFormInput
                      value={data.nlab}
                      onChange={handleUpperChange('nlab')}
                      startDecorator={<Hash size={16} />}
                      error={nlabFieldError}
                    />,
                    'Fecha registro',
                    <TableFormInput
                      type="date"
                      value={data.fecha_evaluacion}
                      onChange={handlePlainChange('fecha_evaluacion')}
                      startDecorator={<CalendarDays size={16} />}
                      error={errors.fecha_evaluacion}
                    />
                  )}
                  {renderRow(
                    'Especie',
                    <TableFormSelect
                      value={data.especie}
                      onChange={handleEspecieSelect}
                      options={especiesOptions}
                      startDecorator={<Sprout size={16} />}
                      error={errors.especie}
                      label="Especie"
                    />,
                    'Variedad',
                    <TableFormSelect
                      value={data.variedad}
                      onChange={handleVariedadSelect}
                      options={variedadOptions}
                      startDecorator={<Sprout size={16} />}
                      error={errors.variedad}
                      label="Variedad"
                    />
                  )}
                  {renderRow(
                    'Semillera',
                    <TableFormInput
                      value={data.semillera}
                      onChange={handleUpperNoTrimChange('semillera')}
                      startDecorator={<Hash size={16} />}
                      error={errors.semillera}
                    />,
                    'Cooperador (opcional)',
                    <TableFormInput
                      value={data.cooperador}
                      onChange={handleUpperNoTrimChange('cooperador')}
                      startDecorator={<Handshake size={16} />}
                      error={errors.cooperador}
                    />
                  )}
                  {renderRow(
                    'Comunidad',
                    <TableFormInput
                      value={data.comunidad}
                      onChange={handleUpperWithSpacesChange('comunidad')}
                      startDecorator={<Hash size={16} />}
                      error={errors.comunidad}
                      list="documento-comunidades"
                    />,
                    'Municipio',
                    <TableFormInput
                      value={data.municipio}
                      onChange={handleUpperWithSpacesChange('municipio')}
                      startDecorator={<Hash size={16} />}
                      error={errors.municipio}
                      list="documento-municipios"
                    />
                  )}
                  {renderFullRow(
                    'Aut. Importación',
                    <TableFormInput
                      value={data.aut_import}
                      onChange={handleUpperWithSpacesChange('aut_import')}
                      startDecorator={<Hash size={16} />}
                      error={errors.aut_import}
                    />
                  )}

                  {renderSectionHeader('2. Especificaciones del lote')}
                  {renderRow(
                    'Categoría inicial',
                    <TableFormInput
                      value={data.categoria_inicial}
                      onChange={handleUpperWithSpacesChange('categoria_inicial')}
                      startDecorator={<Shield size={16} />}
                      error={errors.categoria_inicial}
                    />,
                    'Categoría final',
                    <TableFormInput
                      value={data.categoria_final}
                      onChange={handleUpperWithSpacesChange('categoria_final')}
                      startDecorator={<Shield size={16} />}
                      error={errors.categoria_final}
                    />
                  )}
                  {renderRow(
                    'N° bolsas',
                    <TableFormInput
                      type="number"
                      value={data.bolsas}
                      onChange={handlePlainChange('bolsas')}
                      startDecorator={<Scale size={16} />}
                      error={errors.bolsas}
                      slotProps={numberInputSlotProps}
                    />,
                    'Kg/bolsa',
                    <TableFormInput
                      type="number"
                      value={data.kgbol}
                      onChange={handlePlainChange('kgbol')}
                      startDecorator={<Scale size={16} />}
                      error={errors.kgbol}
                      slotProps={numberInputSlotProps}
                    />
                  )}
                  {renderRow(
                    'Peso total (kg)',
                    <TableFormInput
                      value={totalKg || ''}
                      startDecorator={<Scale size={16} />}
                      readOnly
                    />,
                    'Lote',
                    <TableFormInput
                      value={data.lote}
                      onChange={handleLoteManualChange}
                      startDecorator={<Package size={16} />}
                      error={errors.lote}
                    />
                  )}

                  {renderSectionHeader('3. Análisis de calidad')}
                  <tr>
                    <td colSpan={4} className="p-0">
                      <table className="w-full border border-[rgba(0,0,0,0.08)] border-collapse text-sm bg-transparent">
                        <thead>
                          <tr className="bg-[rgba(22,160,61,0.9)] text-white">
                            <th className={`${accentBorderClass} px-3 py-2 h-[48px] align-middle text-[13px] font-semibold uppercase tracking-wide`}>Humedad (%)</th>
                            <th className={`${accentBorderClass} px-3 py-2 h-[48px] align-middle text-[13px] font-semibold uppercase tracking-wide`}>Germinación (%)</th>
                            <th className={`${accentBorderClass} px-3 py-2 h-[48px] align-middle text-[13px] font-semibold uppercase tracking-wide`}>Viabilidad (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-[1.5px] border-slate-300 px-3 py-2 align-middle">
                            <TableFormInput
                              type="number"
                              value={data.resultado}
                              onChange={handlePlainChange('resultado')}
                              startDecorator={<Thermometer size={16} />}
                              error={errors.resultado}
                              slotProps={numberInputSlotProps}
                            />
                            </td>
                            <td className="border border-[1.5px] border-slate-300 px-3 py-2 align-middle">
                              <TableFormInput
                                type="number"
                                value={data.germinacion_pct}
                                onChange={handlePlainChange('germinacion_pct')}
                                startDecorator={<Activity size={16} />}
                                error={errors.germinacion_pct}
                                slotProps={numberInputSlotProps}
                              />
                            </td>
                            <td className="border border-[1.5px] border-slate-300 px-3 py-2 align-middle">
                              <TableFormInput
                                type="number"
                                value={data.viabilidad_pct}
                                onChange={handlePlainChange('viabilidad_pct')}
                                startDecorator={<Activity size={16} />}
                                error={errors.viabilidad_pct}
                                slotProps={numberInputSlotProps}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  {renderAnalysisBreakdownRow(
                    'Semilla pura (otros)',
                    data.otros_sp_pct,
                    handlePlainChange('otros_sp_pct'),
                    errors.otros_sp_pct,
                    data.otros_sp_kg,
                    handlePlainChange('otros_sp_kg'),
                    errors.otros_sp_kg,
                  )}
                  {renderAnalysisBreakdownRow(
                    'Otros cultivos',
                    data.otros_cultivos_pct,
                    handlePlainChange('otros_cultivos_pct'),
                    errors.otros_cultivos_pct,
                    data.otros_cultivos_kg,
                    handlePlainChange('otros_cultivos_kg'),
                    errors.otros_cultivos_kg,
                  )}
                  {renderAnalysisBreakdownRow(
                    'Malezas comunes',
                    data.malezas_comunes_pct,
                    handlePlainChange('malezas_comunes_pct'),
                    errors.malezas_comunes_pct,
                    data.malezas_comunes_kg,
                    handlePlainChange('malezas_comunes_kg'),
                    errors.malezas_comunes_kg,
                  )}
                  {renderAnalysisBreakdownRow(
                    'Malezas prohibidas',
                    data.malezas_prohibidas_pct,
                    handlePlainChange('malezas_prohibidas_pct'),
                    errors.malezas_prohibidas_pct,
                    data.malezas_prohibidas_kg,
                    handlePlainChange('malezas_prohibidas_kg'),
                    errors.malezas_prohibidas_kg,
                    'danger'
                  )}

                  {renderSectionHeader('4. Conclusión técnica')}
                  {renderRow(
                    'Dictamen',
                    conclusionDictamenContent,
                    'Validez (días)',
                    conclusionValidezContent,
                  )}
                  {renderFullRow(
                    'Malezas nocivas',
                    renderTextareaField(
                      data.malezas_nocivas,
                      handleUpperWithSpacesChange('malezas_nocivas'),
                      errors.malezas_nocivas,
                    ),
                  )}
                  {renderFullRow(
                    'Malezas comunes',
                    renderTextareaField(
                      data.malezas_comunes,
                      handleUpperWithSpacesChange('malezas_comunes'),
                      errors.malezas_comunes,
                    )
                  )}
                  {renderFullRow(
                    'Observaciones',
                    renderTextareaField(
                      data.observaciones,
                      handleObservacionesChange,
                      errors.observaciones,
                    )
                  )}
                </tbody>
              </table>
            </div>
          </form>
          <Modal open={showMissingModal && hasMissingRequired} onClose={() => setShowMissingModal(false)}>
        <ModalDialog size="sm" variant="soft" color="warning">
          <Typography level="title-md" mb={1}>Campos obligatorios</Typography>
          <Typography level="body-sm">{missingMessage}</Typography>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button size="sm" variant="solid" onClick={() => setShowMissingModal(false)}>
              Entendido
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </div>
  );
}
