// Archivo: src/pages/index.js
// El Frontend de Next.js, llama a la Serverless Function para DESCARGAR el PDF

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Home, BarChart3, TrendingUp, DollarSign, Calendar, Mail, Phone, User } from 'lucide-react';

// Se usa una variable de color fijo para evitar problemas de compilación de Tailwind CSS
const BRAND_COLOR_CLASS = 'bg-indigo-700';
const BRAND_TEXT_COLOR = 'text-indigo-700';
const API_URL = '/api/generar-pdf'; // Llama a la Serverless Function

// --- Lógica de cálculo de promedios y generación de propiedad (Mantenida) ---

const calcularPromedios = (data) => {
    const validComparables = data.filter(p => p.estado !== 'Cancelada' && p.precio_publicacion > 0 && p.superficie_total_m2 > 0);
    const total = validComparables.length;

    if (total === 0) {
        return { promedio_publicacion: 0, promedio_venta: 0, promedio_m2: 0, promedio_dias_mercado: 0, total_comparables: 0 };
    }

    const sumPublicacion = validComparables.reduce((sum, p) => sum + p.precio_publicacion, 0);
    const sumVenta = validComparables.reduce((sum, p) => sum + p.precio_venta, 0);
    const sumSuperficie = validComparables.reduce((sum, p) => sum + p.superficie_total_m2, 0);
    const sumDias = validComparables.reduce((sum, p) => sum + p.dias_en_mercado, 0);

    const promedio_publicacion = sumPublicacion / total;
    const promediosVentaData = validComparables.filter(p => p.precio_venta > 0);
    const promedio_venta = promediosVentaData.length > 0 ? (sumVenta / promediosVentaData.length) : 0;
    
    const promedio_m2 = promedio_publicacion / (sumSuperficie / total);
    const promedio_dias_mercado = sumDias / total;

    return {
        promedio_publicacion: parseFloat(promedio_publicacion.toFixed(0)),
        promedio_venta: parseFloat(promedio_venta.toFixed(0)),
        promedio_m2: parseFloat(promedio_m2.toFixed(2)),
        promedio_dias_mercado: parseFloat(promedio_dias_mercado.toFixed(0)),
        total_comparables: total
    };
};

function generateNewProperty(prefix = 'Comparable') {
    return {
        id: crypto.randomUUID(),
        numero: prefix,
        tipo_operacion: 'Venta',
        tipo_inmueble: 'Departamento',
        ubicacion: '',
        estado: 'Activa',
        precio_publicacion: 0,
        precio_venta: 0,
        superficie_total_m2: 0,
        superficie_cubierta_m2: 0,
        ambientes: 0,
        dormitorios: 0,
        expensas: 0,
        cochera: false,
        antiguedad_años: 0,
        dias_en_mercado: 0
    };
}


// --- Componente Principal ---
const App = () => {
    const [propiedadPrincipal, setPropiedadPrincipal] = useState(generateNewProperty('Principal'));
    const [comparables, setComparables] = useState([]);
    const [agente, setAgente] = useState({
        nombre: 'Juan Pérez',
        telefono: '+54 9 221 555-1234',
        email: 'juan.perez@lpzbienesraices.com',
        matricula: 'CMCPLZ-1234'
    });
    
    // Eliminamos reporteHTML, ya que forzaremos la descarga
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addComparable = () => setComparables(prev => [...prev, generateNewProperty(`Comp ${prev.length + 1}`)]);
    const removeComparable = (id) => setComparables(prev => prev.filter(c => c.id !== id));
    const updateComparable = (id, field, value) => setComparables(prev => prev.map(c => 
        c.id === id ? { ...c, [field]: value } : c
    ));
    const updatePrincipal = (field, value) => setPropiedadPrincipal(prev => ({ ...prev, [field]: value }));
    const updateAgente = (field, value) => setAgente(prev => ({ ...prev, [field]: value }));

    const promedios = useMemo(() => calcularPromedios(comparables), [comparables]);
    
    const allDataForAPI = useMemo(() => ({
        propiedadPrincipal: propiedadPrincipal,
        comparables: comparables,
        agente: agente,
        promedios: promedios,
    }), [propiedadPrincipal, comparables, agente, promedios]);

    /**
     * Maneja la llamada a la Serverless Function y la descarga del PDF (Blob)
     */
    const generarReporte = async () => {
        if (comparables.length < 1) {
            setError("Debe añadir al menos una propiedad comparable para generar el reporte.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allDataForAPI)
            });

            if (!response.ok) {
                // Si la respuesta no es OK, leemos el cuerpo como texto para evitar el error 'json'
                const errorText = await response.text();
                let errorMessage = `Error del servidor (${response.status}).`;
                try {
                    // Intentamos parsear como JSON si el error fue enviado estructurado
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    // Si no es JSON, usamos el texto de error o el código de estado
                    errorMessage = `Error ${response.status}: ${errorText.substring(0, 100)}...`;
                }
                throw new Error(errorMessage);
            }

            // RESPUESTA EXITOSA: Manejamos la respuesta binaria (el PDF Blob)
            const pdfBlob = await response.blob();
            
            // Crear una URL temporal para el Blob
            const url = window.URL.createObjectURL(pdfBlob);
            
            // Crear un enlace temporal para forzar la descarga
            const a = document.createElement('a');
            a.href = url;
            a.download = "Reporte_LPZ_BIENES_RAICES.pdf"; // Nombre de archivo forzado por el cliente
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            // Limpiar la URL del objeto
            window.URL.revokeObjectURL(url);
            
            // Mensaje de éxito temporal
            setError(null);
            // Usamos una alerta temporal personalizada en lugar de alert()
            const successMessage = document.getElementById('message-area');
            successMessage.innerHTML = `<div class="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                ¡Reporte PDF generado y listo para descargar!
            </div>`;
            setTimeout(() => { successMessage.innerHTML = ''; }, 5000);


        } catch (err) {
            console.error("Error al generar el reporte:", err);
            // Mensaje de error más descriptivo para el usuario
            let userError = err.message;
            if (err.message.includes("403")) {
                userError = "Error 403: Verifique que la GEMINI_API_KEY esté habilitada en Vercel.";
            } else if (err.message.includes("500")) {
                userError = "Error 500: Error interno en la Serverless Function. Revise logs en Vercel.";
            }
            setError(`Error en la descarga: ${userError}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formattedPrice = (price) => `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)}`;

    // --- Componentes Reutilizables (JSX) ---

    // Componentes PropertyForm, InputGroup, MetricCard se mantienen iguales
    const InputGroup = ({ label, type = 'text', value, onUpdate, children, min = 0 }) => (
        <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
            {type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onUpdate(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                    {children}
                </select>
            ) : (
                <input
                    type={type}
                    min={type === 'number' ? min : undefined}
                    value={type === 'number' ? (value || '') : value}
                    onChange={(e) => onUpdate(type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
            )}
        </div>
    );

    const PropertyForm = ({ propiedad, onUpdate, isPrincipal }) => (
        <div className={`p-4 rounded-xl shadow-lg border ${isPrincipal ? 'bg-white border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isPrincipal ? BRAND_TEXT_COLOR : 'text-gray-700'}`}>
                {isPrincipal ? 'Propiedad Principal (Sujeta a Tasación)' : propiedad.numero}
                <Home className="w-5 h-5 ml-2" />
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Inputs */}
                <InputGroup label="Operación" type="select" value={propiedad.tipo_operacion} onUpdate={(v) => onUpdate('tipo_operacion', v)}>
                    <option>Venta</option><option>Alquiler</option>
                </InputGroup>
                <InputGroup label="Inmueble" type="select" value={propiedad.tipo_inmueble} onUpdate={(v) => onUpdate('tipo_inmueble', v)}>
                    <option>Departamento</option><option>Casa</option><option>Lote</option><option>Otro</option>
                </InputGroup>
                <div className="col-span-2 md:col-span-2"><InputGroup label="Ubicación" value={propiedad.ubicacion} onUpdate={(v) => onUpdate('ubicacion', v)} /></div>
                <InputGroup label="Estado" type="select" value={propiedad.estado} onUpdate={(v) => onUpdate('estado', v)}>
                    <option>Activa</option><option>Cerrada</option><option>Reservada</option><option>Cancelada</option>
                </InputGroup>
                
                <InputGroup label="Precio Publicación (USD)" type="number" value={propiedad.precio_publicacion} onUpdate={(v) => onUpdate('precio_publicacion', v)} />
                <InputGroup label="Precio Venta Final (USD)" type="number" value={propiedad.precio_venta} onUpdate={(v) => onUpdate('precio_venta', v)} />
                <InputGroup label="Sup. Total (m²)" type="number" value={propiedad.superficie_total_m2} onUpdate={(v) => onUpdate('superficie_total_m2', v)} />
                <InputGroup label="Sup. Cubierta (m²)" type="number" value={propiedad.superficie_cubierta_m2} onUpdate={(v) => onUpdate('superficie_cubierta_m2', v)} />

                <InputGroup label="Ambientes" type="number" value={propiedad.ambientes} onUpdate={(v) => onUpdate('ambientes', v)} min={0} />
                <InputGroup label="Dormitorios" type="number" value={propiedad.dormitorios} onUpdate={(v) => onUpdate('dormitorios', v)} min={0} />
                <InputGroup label="Expensas ($)" type="number" value={propiedad.expensas} onUpdate={(v) => onUpdate('expensas', v)} min={0} />
                <InputGroup label="Antigüedad (años)" type="number" value={propiedad.antiguedad_años} onUpdate={(v) => onUpdate('antiguedad_años', v)} min={0} />
                <InputGroup label="Días en Mercado" type="number" value={propiedad.dias_en_mercado} onUpdate={(v) => onUpdate('dias_en_mercado', v)} min={0} />

                <div className="flex items-center pt-2">
                    <input
                        id={`cochera-${propiedad.id}`}
                        type="checkbox"
                        checked={propiedad.cochera}
                        onChange={(e) => onUpdate('cochera', e.target.checked)}
                        className={`form-checkbox h-5 w-5 ${BRAND_TEXT_COLOR} rounded focus:ring-indigo-700`}
                    />
                    <label htmlFor={`cochera-${propiedad.id}`} className="ml-2 text-sm font-medium text-gray-700">Incluye Cochera</label>
                </div>
            </div>
        </div>
    );

    const MetricCard = ({ icon, title, value, subtext }) => (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-start border-l-4 border-indigo-400">
            <div className="mr-3 p-2 bg-indigo-50 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {subtext && <p className="text-xs text-red-500 mt-1">{subtext}</p>}
            </div>
        </div>
    );
    // --- Fin Componentes Reutilizables ---


    // --- Interfaz de Edición Principal ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className={`text-4xl font-extrabold ${BRAND_TEXT_COLOR} mb-2`}>LPZ BIENES RAÍCES</h1>
                    <p className="text-xl text-gray-600">Generador de Reporte Comparativo de Mercado (RCM)</p>
                </header>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">1. Datos de la Propiedad a Tasar</h2>
                    <PropertyForm propiedad={propiedadPrincipal} onUpdate={updatePrincipal} isPrincipal={true} />
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                        2. Propiedades Comparables
                        <button
                            onClick={addComparable}
                            className={`px-4 py-2 ${BRAND_COLOR_CLASS} text-white font-semibold rounded-full shadow-md hover:bg-indigo-600 transition flex items-center`}
                        >
                            <Plus className="w-5 h-5 mr-1" /> Añadir Comparable
                        </button>
                    </h2>
                    
                    <div className="space-y-4">
                        {comparables.map((comp) => (
                            <div key={comp.id} className="flex items-start gap-4">
                                <div className="flex-grow">
                                    <PropertyForm 
                                        propiedad={comp} 
                                        onUpdate={(f, v) => updateComparable(comp.id, f, v)} 
                                        isPrincipal={false} 
                                    />
                                </div>
                                <button
                                    onClick={() => removeComparable(comp.id)}
                                    className="p-3 mt-4 bg-red-100 text-red-600 rounded-full shadow-sm hover:bg-red-200 transition"
                                    title="Eliminar Comparable"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {comparables.length === 0 && (
                            <div className="text-center p-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-lg">
                                Ingrese al menos una propiedad comparable para calcular el promedio de mercado.
                            </div>
                        )}
                    </div>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">3. Pre-visualización y Datos del Agente</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pre-visualización de Promedios */}
                        <div className="lg:col-span-2">
                            <h3 className={`text-xl font-semibold mb-3 ${BRAND_TEXT_COLOR} flex items-center`}>
                                <BarChart3 className="w-5 h-5 mr-2" />
                                Promedios del Mercado (N={promedios.total_comparables})
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <MetricCard 
                                    icon={<DollarSign className="w-6 h-6 text-green-500" />}
                                    title="Precio Prom. Publicación"
                                    value={formattedPrice(promedios.promedio_publicacion)}
                                />
                                <MetricCard 
                                    icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                                    title="Precio Prom. por m²"
                                    value={`USD ${promedios.promedio_m2.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                                />
                                <MetricCard 
                                    icon={<DollarSign className="w-6 h-6 text-green-500" />}
                                    title="Precio Prom. Venta Final"
                                    value={formattedPrice(promedios.promedio_venta)}
                                    subtext={promedios.promedio_venta === 0 ? "Faltan datos de Venta Cerrada" : ""}
                                />
                                <MetricCard 
                                    icon={<Calendar className="w-6 h-6 text-blue-500" />}
                                    title="Prom. Días en Mercado"
                                    value={`${promedios.promedio_dias_mercado} días`}
                                />
                            </div>

                            {/* Tabla Resumen de Comparables */}
                            <h4 className="text-lg font-semibold mt-6 mb-2 text-gray-700">Tabla Resumen de Comparables</h4>
                            <div className="overflow-x-auto bg-gray-50 rounded-lg p-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className={`bg-indigo-700 text-white`}>
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Ubicación</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Sup. Total</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Dorm.</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Precio Pub.</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comparables.slice(0, 5).map((comp, index) => (
                                            <tr key={comp.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{comp.ubicacion || 'Sin Ubicación'}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{comp.superficie_total_m2} m²</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{comp.dormitorios}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 font-semibold">{formattedPrice(comp.precio_publicacion)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${comp.estado === 'Cerrada' ? 'bg-green-100 text-green-800' : 
                                                          comp.estado === 'Activa' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`
                                                    }>
                                                        {comp.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {comparables.length > 5 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-2 text-sm text-gray-500 bg-gray-100">
                                                    ...y {comparables.length - 5} comparables más (ver detalle en PDF).
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Datos del Agente */}
                        <div className="lg:col-span-1 border-l-2 border-gray-200 pl-6 space-y-3">
                            <h3 className={`text-xl font-semibold mb-3 ${BRAND_TEXT_COLOR} flex items-center`}>
                                <User className="w-5 h-5 mr-2" />
                                Datos del Agente/Oficina
                            </h3>
                            <InputGroup label="Nombre del Agente" value={agente.nombre} onUpdate={(v) => updateAgente('nombre', v)} />
                            <InputGroup label="Teléfono" value={agente.telefono} onUpdate={(v) => updateAgente('telefono', v)} />
                            <InputGroup label="Email" value={agente.email} onUpdate={(v) => updateAgente('email', v)} />
                            <InputGroup label="Matrícula" value={agente.matricula} onUpdate={(v) => updateAgente('matricula', v)} />
                        </div>
                    </div>
                </section>

                {/* Botón de Acción y Mensajes */}
                <footer className="text-center p-4">
                    <div id="message-area">
                        {error && (
                            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={generarReporte}
                        disabled={isLoading || comparables.length < 1}
                        className={`w-full md:w-auto px-12 py-4 ${BRAND_COLOR_CLASS} text-white text-xl font-bold rounded-xl shadow-2xl shadow-indigo-400/50 hover:bg-indigo-600 transition disabled:bg-gray-400 flex items-center justify-center mx-auto`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando PDF...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="w-6 h-6 mr-3" />
                                Generar Reporte PDF
                            </>
                        )}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        La Serverless Function generará y forzará la descarga del archivo PDF.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;
