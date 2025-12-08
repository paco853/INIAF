import React from 'react';

export default function AparienciaDocumento() {
  return (
    <div>
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur shadow-xl rounded-3xl p-8 border border-white/60">
        <header className="flex flex-col gap-1 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Apariencia de Documentos</p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Persistencia Activada (Demo)
            </span>
          </div>
          <p className="text-2xl font-semibold text-slate-900">Configura los logotipos y el texto del pie de página.</p>
        </header>

        <section className="grid lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1.1fr)] gap-6">
          <div className="space-y-6">
            <div className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">1. Encabezados Superiores</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['Logo Izquierdo', 'Logo Derecho'].map((label) => (
                  <div key={label} className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-800">{label}</p>
                    <div className="h-36 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center text-slate-500 text-sm bg-white/70">
                      <span className="text-3xl">⤴︎</span>
                      <p>Subir Imagen</p>
                      <p className="text-xs text-slate-400">400x150px (PNG)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">2. Pie de Página</h2>
              <label className="text-sm font-semibold text-emerald-800">Texto del Pie de Página</label>
              <textarea
                className="w-full min-h-[140px] rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                defaultValue="Av. 6 de Agosto esq. J.J. Pérez. Edif. Los Jardines 2do Piso\nTeléfono: (591-2) 2441153 - La Paz, Bolivia"
              />
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-700 mb-4">Vista Previa</h3>
              <div className="h-56 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
                <div className="text-slate-400 text-lg font-semibold">INI AF</div>
                <div className="w-10 h-10 border-2 border-dashed border-slate-300 rounded-full mt-2" />
                <div className="h-2 w-2/3 bg-slate-200 mt-6 rounded-full" />
                <div className="h-2 w-1/2 bg-slate-200 mt-2 rounded-full" />
                <div className="h-2 w-3/4 bg-slate-200 mt-2 rounded-full" />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Simulación de estructura A4</p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
