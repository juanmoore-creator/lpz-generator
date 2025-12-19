import { useState, useMemo } from 'react';
import {
  Upload, Home, Trash2, Plus, AlertCircle, FileSpreadsheet, Save, FolderOpen, X, FileText,
  Pencil, ChevronDown, ChevronUp, CheckSquare, BarChart, Database
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/ui/Card'; // Importing helper if needed or just use clsx/tailwind directly
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import PDFGenerator from '../components/PDFGenerator';
import ReportView from '../components/ReportView';
// import { useAuth } from '../context/AuthContext'; // Removed unused import
import { useValuation } from '../hooks/useValuation';
import { formatCurrency, formatNumber } from '../utils/format';
import { SURFACE_TYPES, DEFAULT_FACTORS } from '../constants';
import { ImageUpload } from '../components/ImageUpload';
import type { SurfaceType } from '../types/index';

function Dashboard() {
  // const { logout } = useAuth(); // Removed unused hook

  const {
    target, updateTarget,
    comparables, addComparable, updateComparable, deleteComparable, processedComparables,
    savedValuations, handleNewValuation, handleSaveValuation, handleDeleteValuation, handleLoadValuation,
    sheetUrl, setSheetUrl, handleImportFromSheet,
    brokerName, setBrokerName,
    matricula, setMatricula,
    pdfTheme, setPdfTheme,
    stats, valuation, targetHomogenizedSurface
  } = useValuation();

  // Modal state - this is UI state so we can keep it here or if strict logic moved to hook.
  // The hook has savedValuations data, but the "is modal open" is UI.
  // I will use a local state for the modal since the hook didn't export it (I saw I didn't add it to hook return).
  // Wait, I didn't add `savedValuationsModalOpen` to hook. I only added the logic.
  // I will add it here.
  const [savedValuationsModalOpen, setSavedValuationsModalOpen] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [showOptionalTarget, setShowOptionalTarget] = useState(false);

  const editingComparable = useMemo(() =>
    comparables.find(c => c.id === editingCompId) || null
    , [comparables, editingCompId]);

  // DEBUG: Force Write
  const { user } = useAuth();
  const handleForceWrite = async () => {
    if (!user) return alert("No user");
    try {
      console.log("Forzando escritura en test...");
      const ref = doc(db, 'users', user.uid, 'data', 'test');
      await setDoc(ref, { hello: 'world', time: Date.now() });
      console.log("ESCRITURA FORZADA EXITOSA en:", ref.path);
      alert("Escritura forzada exitosa. Revisa Firestore.");
    } catch (e: any) {
      console.error("Error escritura forzada:", e);
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-8">
      {/* Header removed - using PrivateLayout */}
      <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Administrador de tasaciones</h1>
          <p className="text-slate-500 text-sm">Gestiona tus tasaciones y comparables</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Import Group */}
          <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all shadow-sm">
            <div className="pl-2 pr-1 text-slate-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Pegar link de Google Sheets..."
              className="bg-transparent border-none focus:ring-0 text-xs w-48 text-slate-700 placeholder:text-slate-400 py-1.5"
            />
            <button
              onClick={handleImportFromSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-all active:scale-95 shadow-sm"
            >
              <Upload className="w-3 h-3" /> Importar
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <button onClick={handleNewValuation} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nueva</span>
          </button>
          <button onClick={() => setSavedValuationsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <FolderOpen className="w-4 h-4" /> <span className="hidden sm:inline">Mis Tasaciones</span>
          </button>
          <button onClick={handleSaveValuation} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors shadow-sm shadow-brand/20">
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Guardar</span>
          </button>

          <PDFGenerator
            target={target}
            comparables={processedComparables}
            valuation={valuation}
            stats={stats}
            brokerName={brokerName}
            matricula={matricula}
            theme={pdfTheme}
          />
        </div>
      </div>

      {/* DEBUG BUTTON */}
      <button
        onClick={handleForceWrite}
        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 font-bold flex items-center gap-2"
      >
        <Database className="w-4 h-4" /> FORZAR ESCRITURA
      </button>

      {/* Saved Valuations Modal */}
      {savedValuationsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full p-6 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brand" />
                Mis Tasaciones
              </h3>
              <button onClick={() => setSavedValuationsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {savedValuations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
                  <div className="bg-slate-50 p-4 rounded-full">
                    <FolderOpen className="w-8 h-8 opacity-50" />
                  </div>
                  <p>No tienes tasaciones guardadas aún.</p>
                </div>
              ) : (
                savedValuations.map(val => (
                  <div key={val.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div>
                      <div className="font-medium text-slate-800">{val.name}</div>
                      <div className="text-xs text-slate-500">{new Date(val.date).toLocaleString()} • {val.comparables.length} comparables</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { handleLoadValuation(val); setSavedValuationsModalOpen(false); }}
                        className="px-3 py-1.5 text-xs font-medium text-brand bg-brand/10 hover:bg-brand/20 rounded-md transition-colors"
                      >
                        Cargar
                      </button>
                      <button
                        onClick={() => handleDeleteValuation(val.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right text-xs text-slate-400">
              {savedValuations.length} / 30 guardadas
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Main Content Stack */}
        <div className="space-y-8">

          {/* 1. Target Property - Full Width */}
          <Card className="bg-white border-brand/10 shadow-lg shadow-brand/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-brand">
                  <Home className="w-5 h-5" />
                  <h2 className="font-bold font-heading uppercase tracking-wider text-sm">Propiedad Objetivo</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 uppercase font-medium">Sup. Homogenizada</span>
                    <span className="font-bold text-brand-dark text-lg">{formatNumber(targetHomogenizedSurface)} m²</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Row 1: Main Info */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 uppercase font-medium">Dirección</label>
                    <input
                      type="text"
                      value={target.address}
                      onChange={e => updateTarget({ address: e.target.value })}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-3 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand"
                      placeholder="Ej: Av. Libertador 2000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Sup. Cubierta</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={target.coveredSurface}
                        onChange={e => updateTarget({ coveredSurface: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-100 border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-900 focus:ring-brand focus:border-brand"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 text-sm">m²</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Sup. Descubierta</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={target.uncoveredSurface}
                        onChange={e => updateTarget({ uncoveredSurface: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-100 border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-900 focus:ring-brand focus:border-brand"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 text-sm">m²</span>
                    </div>
                  </div>
                </div>

                {/* Row 1b: Technical */}
                <div className="md:col-span-4 grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Tipo Sup.</label>
                    <select
                      value={target.surfaceType}
                      onChange={e => {
                        const type = e.target.value as SurfaceType;
                        updateTarget({ surfaceType: type, homogenizationFactor: DEFAULT_FACTORS[type] });
                      }}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-2 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand text-sm"
                    >
                      {SURFACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Factor</label>
                    <input
                      type="number"
                      step="0.05"
                      value={target.homogenizationFactor}
                      onChange={e => updateTarget({ homogenizationFactor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-2 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand text-center"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="md:col-span-12">
                  <ImageUpload
                    images={target.images || []}
                    onImagesChange={(imgs) => updateTarget({ images: imgs })}
                    label="Fotos de la Propiedad"
                    maxImages={4}
                  />
                </div>

                {/* Row 2: Details */}
                <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Ambientes</label>
                    <input
                      type="number"
                      value={target.rooms}
                      onChange={e => updateTarget({ rooms: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-2 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Dormitorios</label>
                    <input
                      type="number"
                      value={target.bedrooms}
                      onChange={e => updateTarget({ bedrooms: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-2 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Baños</label>
                    <input
                      type="number"
                      value={target.bathrooms}
                      onChange={e => updateTarget({ bathrooms: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-100 border-slate-200 rounded-lg px-2 py-2 mt-1 text-slate-900 focus:ring-brand focus:border-brand text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium">Antigüedad</label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={target.age}
                        onChange={e => updateTarget({ age: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-100 border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-900 focus:ring-brand focus:border-brand text-center"
                      />
                      <span className="absolute right-2 top-2 text-slate-400 text-xs">años</span>
                    </div>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${target.garage ? 'bg-brand border-brand text-white' : 'bg-slate-50 border-slate-300'}`}>
                        {target.garage && <CheckSquare className="w-4 h-4" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={!!target.garage}
                        onChange={e => updateTarget({ garage: e.target.checked })}
                      />
                      <span className="text-sm text-slate-700 font-medium">Cochera</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setShowOptionalTarget(!showOptionalTarget)}
                      className="flex items-center gap-2 text-brand hover:text-brand-dark transition-colors text-sm font-medium"
                    >
                      {showOptionalTarget ? 'Menos Opciones' : 'Más Opciones'}
                      {showOptionalTarget ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Optional Section (Full Width, Collapsible) */}
                {showOptionalTarget && (
                  <div className="md:col-span-12 p-4 bg-slate-50 rounded-xl animate-in slide-in-from-top-2 duration-200 border border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Semicubierta</label>
                        <input type="number" value={target.semiCoveredSurface} onChange={e => updateTarget({ semiCoveredSurface: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-1.5 mt-1 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Toilettes</label>
                        <input type="number" value={target.toilettes} onChange={e => updateTarget({ toilettes: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-1.5 mt-1 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Pisos</label>
                        <input type="text" value={target.floorType || ''} onChange={e => updateTarget({ floorType: e.target.value })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-1.5 mt-1 text-sm" placeholder="Ej: Parquet" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Deptos. Edif.</label>
                        <input type="number" value={target.apartmentsInBuilding} onChange={e => updateTarget({ apartmentsInBuilding: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-1.5 mt-1 text-sm" />
                      </div>
                      <div className="md:col-span-2 flex flex-wrap gap-4 items-center mt-4">
                        {[
                          { label: 'Apto Crédito', key: 'isCreditEligible' as keyof typeof target },
                          { label: 'Apto Profesional', key: 'isProfessional' as keyof typeof target },
                          { label: 'Financiamiento', key: 'hasFinancing' as keyof typeof target },
                        ].map(item => (
                          <label key={item.label} className="flex items-center gap-2 cursor-pointer select-none">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${target[item.key] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'}`}>
                              {target[item.key] && <CheckSquare className="w-3 h-3" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={!!target[item.key]} onChange={e => updateTarget({ [item.key]: e.target.checked })} />
                            <span className="text-xs text-slate-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 font-heading">Comparables ({comparables.length})</h3>
              <button onClick={addComparable} className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-md transition-colors">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 min-w-[220px]">Dirección</th>
                    <th className="px-4 py-4 text-right w-36">Precio (USD)</th>
                    <th className="px-4 py-4 text-right w-28">Sup. Cub (m²)</th>
                    <th className="px-4 py-4 text-right w-28">Sup. Desc (m²)</th>
                    <th className="px-4 py-4 w-48">Tipo</th>
                    <th className="px-4 py-4 text-center w-24">Factor</th>
                    <th className="px-4 py-4 text-right w-32">$/m² H</th>
                    <th className="px-4 py-4 text-center w-24">Días</th>
                    <th className="px-2 py-4 w-10"></th>
                    <th className="px-2 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedComparables.map((comp) => (
                    <tr key={comp.id} className={cn(
                      "group transition-colors hover:bg-slate-50/80",
                      comp.daysOnMarket < 30 ? "bg-emerald-50/20" : "",
                      comp.daysOnMarket > 120 ? "bg-rose-50/20" : ""
                    )}>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          value={comp.address}
                          onChange={e => updateComparable(comp.id, { address: e.target.value })}
                          className="bg-transparent border-none p-0 w-full focus:ring-0 font-medium text-slate-700 placeholder:text-slate-300"
                          placeholder="Dirección..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={comp.price}
                          onChange={e => updateComparable(comp.id, { price: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent border-none p-0 w-full text-right text-slate-700 font-mono [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={comp.coveredSurface}
                          onChange={e => updateComparable(comp.id, { coveredSurface: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent border-none p-0 w-full text-right text-slate-600 [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={comp.uncoveredSurface}
                          onChange={e => updateComparable(comp.id, { uncoveredSurface: parseFloat(e.target.value) || 0 })}
                          className="bg-transparent border-none p-0 w-full text-right text-slate-600 [&::-webkit-inner-spin-button]:appearance-none focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={comp.surfaceType}
                          onChange={e => {
                            const type = e.target.value as SurfaceType;
                            updateComparable(comp.id, { surfaceType: type, homogenizationFactor: DEFAULT_FACTORS[type] });
                          }}
                          className="bg-transparent border-none p-0 w-full text-slate-600 text-xs cursor-pointer focus:ring-0"
                        >
                          {SURFACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          step="0.05"
                          value={comp.homogenizationFactor}
                          onChange={e => updateComparable(comp.id, { homogenizationFactor: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-50 border border-slate-200 rounded px-1 py-1 w-16 text-center text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-brand/10 focus:border-brand [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-700 text-xs">
                          ${formatNumber(comp.hPrice || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={comp.daysOnMarket}
                          onChange={e => updateComparable(comp.id, { daysOnMarket: parseInt(e.target.value) || 0 })}
                          className={cn(
                            "bg-transparent border-none p-0 w-full text-center focus:ring-0 font-medium [&::-webkit-inner-spin-button]:appearance-none",
                            comp.daysOnMarket < 30 ? "text-emerald-600" : "text-slate-600"
                          )}
                        />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => setEditingCompId(comp.id)} className="text-slate-300 hover:text-brand p-1.5 rounded transition-colors" title="Editar Detalles">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => deleteComparable(comp.id)} className="text-slate-300 hover:text-rose-500 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom Section: Valuation Results & Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Valuation Stats */}
            <div className="lg:col-span-8">
              <Card className="bg-white border-slate-200 h-full">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-slate-800 mb-6">
                    <BarChart className="w-5 h-5 text-brand" />
                    <h2 className="font-bold font-heading uppercase tracking-wider text-sm">Resultados de Valuación</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      label="Venta Rápida"
                      value={formatCurrency(valuation.low)}
                      subtext={`$${formatNumber(stats.terciles[0])}/m²`}
                      color="green"
                    />
                    <StatCard
                      label="Precio de Mercado"
                      value={formatCurrency(valuation.market)}
                      subtext={`$${formatNumber(stats.avg)}/m²`}
                      color="blue"
                    />
                    <StatCard
                      label="Precio Alto"
                      value={formatCurrency(valuation.high)}
                      subtext={`$${formatNumber(stats.terciles[2])}/m²`}
                      color="amber"
                    />
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    <p>Estos valores se calculan utilizando el <strong>Método de Comparables</strong>, ajustando precios por superficie, ubicación y características. El rango sugiere un margen de negociación del ±5% sobre el precio de mercado.</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Configuration */}
            <div className="lg:col-span-4">
              <Card className="bg-white border-slate-200 h-full">
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 mb-2">
                    <AlertCircle className="w-4 h-4 text-brand" />
                    <h2 className="font-semibold text-xs uppercase tracking-wider">Datos del Profesional</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Agente</label>
                      <input
                        type="text"
                        value={brokerName}
                        onChange={e => setBrokerName(e.target.value)}
                        className="w-full bg-slate-100 border-slate-200 rounded-lg px-3 py-2 mt-1 text-slate-800 focus:ring-brand focus:border-brand text-sm"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Matrícula</label>
                      <input
                        type="text"
                        value={matricula}
                        onChange={e => setMatricula(e.target.value)}
                        className="w-full bg-slate-100 border-slate-200 rounded-lg px-3 py-2 mt-1 text-slate-800 focus:ring-brand focus:border-brand text-sm"
                        placeholder="Ej: CUCICBA 1234"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 mb-2">
                    <h2 className="font-semibold text-xs uppercase tracking-wider">Diseño PDF</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Primario</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={pdfTheme.primary}
                          onChange={e => setPdfTheme({ ...pdfTheme, primary: e.target.value })}
                          className="h-8 w-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Secundario</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={pdfTheme.secondary}
                          onChange={e => setPdfTheme({ ...pdfTheme, secondary: e.target.value })}
                          className="h-8 w-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Edit Comparable Modal */}
        {
          editingCompId && editingComparable && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-xl font-bold font-heading text-slate-800">
                    Editar Comparable
                  </h3>
                  <button onClick={() => setEditingCompId(null)} className="text-slate-400 hover:text-slate-600 p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">

                  {/* Indispensables */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-brand uppercase tracking-wider">Indispensables</h4>

                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Dirección</label>
                      <input
                        type="text"
                        value={editingComparable.address}
                        onChange={e => updateComparable(editingComparable.id, { address: e.target.value })}
                        className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Precio (USD)</label>
                        <input
                          type="number"
                          value={editingComparable.price}
                          onChange={e => updateComparable(editingComparable.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Días en Mercado</label>
                        <input
                          type="number"
                          value={editingComparable.daysOnMarket}
                          onChange={e => updateComparable(editingComparable.id, { daysOnMarket: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Cubierta m²</label>
                        <input
                          type="number"
                          value={editingComparable.coveredSurface}
                          onChange={e => updateComparable(editingComparable.id, { coveredSurface: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Descubierta m²</label>
                        <input
                          type="number"
                          value={editingComparable.uncoveredSurface}
                          onChange={e => updateComparable(editingComparable.id, { uncoveredSurface: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Ambientes</label>
                        <input type="number" value={editingComparable.rooms} onChange={e => updateComparable(editingComparable.id, { rooms: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-2 mt-1 text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Dormitorios</label>
                        <input type="number" value={editingComparable.bedrooms} onChange={e => updateComparable(editingComparable.id, { bedrooms: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-2 mt-1 text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Baños</label>
                        <input type="number" value={editingComparable.bathrooms} onChange={e => updateComparable(editingComparable.id, { bathrooms: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-2 py-2 mt-1 text-center" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Antigüedad</label>
                        <input type="number" value={editingComparable.age} onChange={e => updateComparable(editingComparable.id, { age: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1" />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${editingComparable.garage ? 'bg-brand border-brand text-white' : 'bg-slate-50 border-slate-300'}`}>
                            {editingComparable.garage && <CheckSquare className="w-4 h-4" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={!!editingComparable.garage} onChange={e => updateComparable(editingComparable.id, { garage: e.target.checked })} />
                          <span className="text-sm text-slate-700 font-medium">Tiene Cochera</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Images */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <ImageUpload
                      images={editingComparable.images || []}
                      onImagesChange={(imgs) => updateComparable(editingComparable.id, { images: imgs })}
                      label="Fotos del Comparable"
                      maxImages={4}
                    />
                  </div>

                  {/* Optionals */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opcionales</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Semicubierta</label>
                        <input type="number" value={editingComparable.semiCoveredSurface} onChange={e => updateComparable(editingComparable.id, { semiCoveredSurface: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-medium">Toilettes</label>
                        <input type="number" value={editingComparable.toilettes} onChange={e => updateComparable(editingComparable.id, { toilettes: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Pisos</label>
                      <input type="text" value={editingComparable.floorType || ''} onChange={e => updateComparable(editingComparable.id, { floorType: e.target.value })} className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm" placeholder="Ej: Porcelanato" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-medium">Deptos. Edificio</label>
                      <input type="number" value={editingComparable.apartmentsInBuilding} onChange={e => updateComparable(editingComparable.id, { apartmentsInBuilding: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-100 border-slate-200 rounded px-3 py-2 mt-1 text-sm" />
                    </div>
                    <div className="space-y-2 pt-2">
                      {[
                        { label: 'Apto Crédito', key: 'isCreditEligible' as keyof typeof editingComparable },
                        { label: 'Apto Profesional', key: 'isProfessional' as keyof typeof editingComparable },
                        { label: 'Financiamiento', key: 'hasFinancing' as keyof typeof editingComparable },
                      ].map(item => (
                        <label key={item.label} className="flex items-center gap-2 cursor-pointer select-none">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${editingComparable[item.key] ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-300'}`}>
                            {editingComparable[item.key] && <CheckSquare className="w-3 h-3" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={!!editingComparable[item.key]} onChange={e => updateComparable(editingComparable.id, { [item.key]: e.target.checked })} />
                          <span className="text-xs text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setEditingCompId(null)} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-medium text-sm">
                    Listo
                  </button>
                </div>

              </div>
            </div >
          )
        }


        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 font-heading">
            <FileText className="w-5 h-5 text-brand" />
            Vista Previa del Reporte
          </h3>
          <div className="bg-slate-200/50 rounded-xl p-8 overflow-auto flex justify-center border border-slate-200 shadow-inner">
            <div className="scale-[0.6] origin-top shadow-2xl">
              <ReportView
                data={{
                  target: target,
                  brokerName: brokerName || 'Usuario TTasaciones',
                  matricula: matricula || '',
                  clientName: 'Cliente Final',
                  ...valuation
                }}
                properties={processedComparables}
                valuation={valuation}
                stats={stats}
                theme={pdfTheme}
              />
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}
export default Dashboard;
