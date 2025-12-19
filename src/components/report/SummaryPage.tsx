

const SummaryPage = ({ properties, theme }: { properties: any[], theme?: { primary: string, secondary: string } }) => {
    const primaryColor = theme?.primary || '#1e293b';
    const secondaryColor = theme?.secondary || '#4f46e5';

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col">
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
                <h2 className="text-2xl font-bold text-slate-900">Resumen de Comparables</h2>
                <div className="text-sm font-bold" style={{ color: secondaryColor }}>TTasaciones</div>
            </div>

            <p className="mb-6 text-sm text-slate-600">
                A continuación se presenta un resumen de las propiedades seleccionadas para el análisis comparativo de mercado.
            </p>

            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700">
                    <tr>
                        <th className="p-2 border-b-2 border-slate-300">#</th>
                        <th className="p-2 border-b-2 border-slate-300">Dirección</th>
                        <th className="p-2 border-b-2 border-slate-300 text-center">Amb.</th>
                        <th className="p-2 border-b-2 border-slate-300 text-right">Precio (U$S)</th>
                        <th className="p-2 border-b-2 border-slate-300 text-right">Sup. Cub.</th>
                        <th className="p-2 border-b-2 border-slate-300 text-right">Sup. Desc.</th>
                        <th className="p-2 border-b-2 border-slate-300 text-right">$/m² Hom.</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((p, i) => {
                        const hSurface = p.coveredSurface + (p.uncoveredSurface * (p.homogenizationFactor || 0.5));
                        const pricePerM2 = hSurface > 0 ? Math.round(p.price / hSurface) : 0;
                        return (
                            <tr key={p.id || i} className="border-b border-slate-100">
                                <td className="p-2">{i + 1}</td>
                                <td className="p-2 font-medium">{p.address}</td>
                                <td className="p-2 text-center">{p.rooms || '-'}</td>
                                <td className="p-2 text-right">{p.price.toLocaleString()}</td>
                                <td className="p-2 text-right">{p.coveredSurface} m²</td>
                                <td className="p-2 text-right">{p.uncoveredSurface} m²</td>
                                <td className="p-2 text-right font-bold" style={{ color: primaryColor }}>{pricePerM2.toLocaleString()}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                <span>Reporte generado el {new Date().toLocaleDateString()}</span>
                <span>Página 3</span>
            </div>
        </div>
    );
};

export default SummaryPage;
