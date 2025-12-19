

const MapPage = ({ properties, theme }: { properties: any[], theme?: { primary: string, secondary: string } }) => {
    const primaryColor = theme?.primary || '#1e293b';
    const secondaryColor = theme?.secondary || '#4f46e5';

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2" style={{ borderColor: primaryColor }}>Ubicación de Comparables</h2>
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 mb-8">
                <p className="text-slate-400">Mapa de Ubicación (Placeholder)</p>
            </div>
            <div>
                <ul className="space-y-2">
                    {properties.map((p, i) => (
                        <li key={p.id || i} className="text-md text-slate-700">
                            <span className="font-bold mr-2" style={{ color: secondaryColor }}>{i + 1}.</span>
                            {p.address}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MapPage;
