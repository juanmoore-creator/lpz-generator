

const AveragesPage = ({ properties, theme }: { properties: any[], theme?: { primary: string, secondary: string } }) => {
    const primaryColor = theme?.primary || '#1e293b';
    const secondaryColor = theme?.secondary || '#4f46e5';

    const count = properties.length;
    if (count === 0) return null;

    const total = properties.reduce((acc, p) => {
        const hSurface = p.coveredSurface + (p.uncoveredSurface * (p.homogenizationFactor || 0.5));

        acc.price += Number(p.price) || 0;
        acc.coveredSurface += Number(p.coveredSurface) || 0;
        acc.hSurface += hSurface;
        acc.daysOnMarket += Number(p.daysOnMarket) || 0;
        return acc;
    }, { price: 0, coveredSurface: 0, hSurface: 0, daysOnMarket: 0 });

    const avgPrice = total.price / count;
    const avgCovered = total.coveredSurface / count;
    const avgHomogenized = total.hSurface / count;
    const avgDays = total.daysOnMarket / count;
    const avgPricePerM2 = avgHomogenized > 0 ? avgPrice / avgHomogenized : 0;

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col">
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
                <h2 className="text-2xl font-bold text-slate-900">Análisis de Mercado</h2>
                <div className="text-sm font-bold" style={{ color: secondaryColor }}>TTasaciones</div>
            </div>

            <div className="flex gap-8 mb-12">
                <div className="flex-1 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h3 className="text-slate-500 text-sm mb-2">Propiedades Analizadas</h3>
                    <span className="text-4xl font-bold text-slate-800">{count}</span>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-lg border" style={{ borderColor: secondaryColor }}>
                    <h3 className="text-sm mb-2 opacity-70" style={{ color: primaryColor }}>Precio Promedio</h3>
                    <span className="text-4xl font-bold" style={{ color: primaryColor }}>U$S {Math.round(avgPrice).toLocaleString()}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2 inline-block" style={{ borderColor: primaryColor }}>Detalle de Promedios</h3>
            <table className="w-full text-sm mb-12">
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-3 text-slate-600">Precio de Venta</td>
                        <td className="py-3 text-right font-bold" style={{ color: primaryColor }}>U$S {Math.round(avgPrice).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="py-3 text-slate-600">Precio por m² (Homogenizado)</td>
                        <td className="py-3 text-right">U$S {Math.round(avgPricePerM2).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td className="py-3 text-slate-600">Superficie Cubierta Promedio</td>
                        <td className="py-3 text-right">{Math.round(avgCovered)} m²</td>
                    </tr>
                    <tr>
                        <td className="py-3 text-slate-600">Superficie Homogenizada Promedio</td>
                        <td className="py-3 text-right">{Math.round(avgHomogenized)} m²</td>
                    </tr>
                    <tr>
                        <td className="py-3 text-slate-600">Días en el Mercado</td>
                        <td className="py-3 text-right">{Math.round(avgDays)} días</td>
                    </tr>
                </tbody>
            </table>

            <div className="p-6 bg-slate-50 border-l-4 text-slate-600 text-sm leading-relaxed" style={{ borderColor: primaryColor }}>
                <h4 className="font-bold mb-2" style={{ color: primaryColor }}>Conclusión del Análisis</h4>
                El análisis de mercado basado en las {count} propiedades seleccionadas indica una tendencia clara.
                Los valores obtenidos reflejan el estado actual de la oferta en la zona y sirven como base sólida
                para determinar el valor de mercado de la propiedad tasada.
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                <span>Reporte generado el {new Date().toLocaleDateString()}</span>
                <span>Página {count + 5}</span>
            </div>
        </div>
    );
};

export default AveragesPage;
