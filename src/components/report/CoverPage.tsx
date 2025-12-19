
const CoverPage = ({ data, theme }: { data: any; theme?: any }) => {
    // Brand Colors
    const deepNavyBlue = theme?.primary || '#1A2B4C';
    const goldAccent = theme?.secondary || '#C5A059';


    return (
        <div className="print-page cover-page h-[1123px] w-[794px] bg-white relative flex overflow-hidden font-sans">
            {/* 1. Franja Lateral Izquierda (25% del ancho) */}
            <div className="w-1/4 h-full relative flex flex-col items-center pt-24" style={{ backgroundColor: deepNavyBlue }}>
                {/* Logo in Sidebar for contrast */}
                <div className="mb-12 px-6 w-full flex justify-center">
                    <img
                        src="/logo_lpz.png"
                        alt="Lopez Tasaciones"
                        className="w-full object-contain filter drop-shadow-lg"
                        style={{ maxWidth: '140px' }}
                    />
                </div>

                {/* Decorative vertical line in sidebar */}
                <div className="flex-1 w-px bg-white/20 mb-24"></div>
            </div>

            {/* Main Content Area (75% del ancho) */}
            <div className="w-3/4 h-full relative flex flex-col px-20 py-24">

                {/* Top Accent Line */}
                <div className="absolute top-24 left-0 w-24 h-1" style={{ backgroundColor: goldAccent }}></div>

                {/* Vertical Spacing */}
                <div className="mt-20">

                    {/* 3. Jerarquía Tipográfica Refinada */}
                    <div className="mb-4">
                        <h1 className="text-6xl font-black font-heading tracking-tight leading-none uppercase" style={{ color: deepNavyBlue }}>
                            Reporte de<br />
                            <span className="text-5xl font-bold opacity-90">Tasación</span>
                        </h1>
                    </div>

                    <div className="mb-24 flex items-center gap-4">
                        <div className="h-px w-12 bg-gray-300"></div>
                        <h2 className="text-xl font-semibold tracking-[0.2em] text-gray-400 uppercase">
                            Comparables
                        </h2>
                    </div>

                    {/* Datos de la Propiedad */}
                    <div className="mb-16">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goldAccent }}></span>
                            Propiedad
                        </p>
                        <p className="text-4xl font-bold text-slate-900 leading-tight">
                            {data.target?.address || 'Dirección de la Propiedad'}
                        </p>
                        {data.target?.location && (
                            <p className="text-xl text-slate-500 mt-2 font-light">
                                {data.target.location}
                            </p>
                        )}
                    </div>

                    {/* Property Image */}
                    {data.target?.images && data.target.images.length > 0 && (
                        <div className="mb-10 w-full h-48 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                            <img
                                src={data.target.images[0]}
                                alt="Propiedad"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Preparado para */}
                    <div className="mb-24">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goldAccent }}></span>
                            Preparado para
                        </p>
                        <p className="text-2xl text-slate-800 font-medium">
                            {data.clientName || 'Nombre del Cliente'}
                        </p>
                    </div>

                    {/* 5. Footer con Línea Divisoria */}
                    <div className="absolute bottom-24 left-20 right-20">
                        {/* Línea Divisoria Bicolor */}
                        <div className="flex w-full h-0.5 mb-8">
                            <div className="w-1/4" style={{ backgroundColor: goldAccent }}></div>
                            <div className="w-3/4 bg-gray-100"></div>
                        </div>

                        {/* Datos del Corredor + Fecha */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Corredor Inmobiliario</p>
                                <p className="text-lg font-bold" style={{ color: deepNavyBlue }}>
                                    {data.brokerName || 'Gabriel Lopez'}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">
                                    {data.matricula ? `Matrícula ${data.matricula}` : 'Matrícula #'}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-400 font-medium">
                                    {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Background Watermark - More subtle and larger */}
                <div className="absolute bottom-0 right-0 opacity-[0.02] pointer-events-none translate-x-1/4 translate-y-1/4">
                    <svg width="600" height="600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CoverPage;
