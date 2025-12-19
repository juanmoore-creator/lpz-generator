

const PriceSuggestionPage = ({ data, stats, theme }: { data: any, stats: any, theme?: { primary: string, secondary: string } }) => {
    // Default colors if theme is not provided
    const primaryColor = theme?.primary || '#1e293b'; // slate-900
    const secondaryColor = theme?.secondary || '#4f46e5'; // indigo-600 used as accent in some places

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex justify-between items-end mb-16 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
                <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>Valores Sugeridos</h2>
                <div className="text-sm font-bold opacity-80" style={{ color: secondaryColor }}>TTasaciones</div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-12 w-full max-w-2xl text-center self-center mt-8">

                {/* Market Value Card - Main Focus */}
                <div className="bg-white border-2 p-12 rounded-2xl shadow-sm relative flex flex-col items-center justify-center" style={{ borderColor: secondaryColor }}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest shadow-md" style={{ backgroundColor: primaryColor }}>
                        Rango de Mercado
                    </div>
                    <h3 className="text-slate-500 mb-3 font-medium uppercase tracking-wide text-sm">Valor Estimado</h3>
                    <div className="text-6xl font-extrabold font-sans tracking-tight" style={{ color: primaryColor }}>
                        U$S {Math.round(data.market).toLocaleString()}
                    </div>
                    <p className="text-slate-400 mt-3 text-sm font-medium">
                        Basado en un promedio de ${(stats?.avg || 0).toLocaleString()}/m²
                    </p>
                </div>

                {/* Sub Scenarios */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Conservative */}
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl relative flex flex-col items-center justify-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                            Venta Rápida
                        </div>
                        <h3 className="text-slate-500 mb-2 text-xs uppercase font-semibold">Escenario Conservador</h3>
                        <div className="text-3xl font-bold text-slate-700">
                            U$S {Math.round(data.low).toLocaleString()}
                        </div>
                    </div>

                    {/* Optimistic */}
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl relative flex flex-col items-center justify-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                            Valor Alto
                        </div>
                        <h3 className="text-slate-500 mb-2 text-xs uppercase font-semibold">Escenario Optimista</h3>
                        <div className="text-3xl font-bold text-slate-700">
                            U$S {Math.round(data.high).toLocaleString()}
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-slate-100 w-full flex justify-between text-xs text-slate-400">
                <span>Reporte generado el {new Date().toLocaleDateString()}</span>
                <span>Página Final</span>
            </div>
        </div>
    );
};

export default PriceSuggestionPage;
