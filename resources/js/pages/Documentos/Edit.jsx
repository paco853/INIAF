import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import {
  Stack,
  Typography,
  Button,
  Alert,
  Modal,
  ModalDialog,
} from '@mui/joy';
import GeneralSection from './components/GeneralSection';
import UbicacionSection from './components/UbicacionSection';
import RecepcionSection from './components/RecepcionSection';
import AnalisisSection from './components/AnalisisSection';
import EstadoValidezSection from './components/EstadoValidezSection';
import MalezasSection from './components/MalezasSection';
import ObservacionesSection from './components/ObservacionesSection';
import useDocumentoForm from './hooks/useDocumentoForm';

// DOCUMENTO_EDIT






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
    handleUpperNoTrimChange,
    handlePlainChange,
    handleVariedadSelect,
    handleEspecieSelect,
    handleObservacionesChange,
    handleAnioChange,
    handleTextareaInput,
    handleEstadoChange,
    handleLoteManualChange,
  } = useDocumentoForm({ doc, loteSuggestions, cultivos });

  return (
    <form onSubmit={submit} noValidate className="doc-form">
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

      <Stack spacing={2}>
        <Typography level="h4">Editar documento #{doc.id}</Typography>
        {flash?.status && <Alert color="success" variant="soft">{flash.status}</Alert>}
        {flash?.error && <Alert color="danger" variant="soft">{flash.error}</Alert>}
        {missingMessage && <Alert color="warning" variant="soft">{missingMessage}</Alert>}
        {nlabClientError && (
          <Alert color="warning" variant="soft">
            {nlabClientError}
          </Alert>
        )}
        {serverErrors.length > 0 && (
          <Alert color="danger" variant="soft">
            <Typography level="title-sm" sx={{ fontWeight: 700, mb: 0.5 }}>
              Corrige los siguientes campos:
            </Typography>
            <ul className="list-compact">
              {serverErrors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Stack className="doc-sections" spacing={2}>
          <GeneralSection
            data={data}
            errors={errors}
            nlabFieldError={nlabFieldError}
            especiesOptions={especiesOptions}
            onUpperChange={handleUpperChange}
            onPlainChange={handlePlainChange}
            onEspecieSelect={handleEspecieSelect}
          />

          <UbicacionSection
            data={data}
            errors={errors}
            onUpperChange={handleUpperChange}
          />

          <RecepcionSection
            data={data}
            errors={errors}
            variedadOptions={variedadOptions}
            onVariedadSelect={handleVariedadSelect}
            onUpperChange={handleUpperChange}
            onUpperNoTrimChange={handleUpperNoTrimChange}
            onPlainChange={handlePlainChange}
            onAnioChange={handleAnioChange}
            onLoteManualChange={handleLoteManualChange}
            totalKg={totalKg}
          />

          <AnalisisSection
            data={data}
            errors={errors}
            onPlainChange={handlePlainChange}
          />

          <EstadoValidezSection
            data={data}
            errors={errors}
            estadoValue={estadoValue}
            onEstadoChange={handleEstadoChange}
            onUpperChange={handleUpperChange}
          />

          <MalezasSection
            data={data}
            errors={errors}
            onUpperChange={handleUpperChange}
            onTextareaInput={handleTextareaInput}
          />

          <ObservacionesSection
            data={data}
            errors={errors}
            onChange={handleObservacionesChange}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="solid" disabled={processing || checkingNlab}>
            {checkingNlab ? 'Validando…' : 'Guardar'}
          </Button>
          <Button variant="outlined" color="neutral" component={Link} href="/ui/documentos">
            Cancelar
          </Button>
        </Stack>
      </Stack>

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
    </form>
  );
}
