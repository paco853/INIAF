import React from 'react';
import { StickyNote } from 'lucide-react';
import FormField from '../../../components/FormField';

export default function ObservacionesSection({ data, errors, onChange }) {
  return (
    // DOCUMENTO_EDIT_COMPONENT





    
    <div className="doc-section">
      <div className="doc-section__title">
        <StickyNote size={18} />
        <span>Observaciones</span>
      </div>
      <FormField
        label="Observaciones"
        value={data.observaciones}
        onChange={onChange}
        textarea
        minRows={3}
        error={errors.observaciones}
        startDecorator={<StickyNote size={16} />}
      />
    </div>
  );
}
