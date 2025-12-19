

const PropertyDetailPage = ({ property, index, theme }: { property: any, index: number, theme?: { primary: string, secondary: string } }) => {
    const primaryColor = theme?.primary || '#1e293b';
    const secondaryColor = theme?.secondary || '#4f46e5';

    const hSurface = property.coveredSurface + (property.uncoveredSurface * (property.homogenizationFactor || 0.5));
    const pricePerM2 = hSurface > 0 ? Math.round(property.price / hSurface) : 0;

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col">
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
                <h2 className="text-2xl font-bold text-slate-900">Comparable #{index + 1}</h2>
                <div className="text-sm font-bold" style={{ color: secondaryColor }}>TTasaciones</div>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{property.address}</h1>
                    <span className="text-slate-500 text-lg">Propiedad Comparable</span>
                </div>
                <div className="text-right">
                    <span className="block text-3xl font-bold" style={{ color: primaryColor }}>
                        U$S {property.price.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="h-64 mb-8">
                {property.images && property.images.length > 0 ? (
                    <div className={`grid gap-4 h-full ${property.images.length === 1 ? 'grid-cols-1' :
                            property.images.length === 2 ? 'grid-cols-2' :
                                property.images.length === 3 ? 'grid-cols-2 grid-rows-2' :
                                    'grid-cols-2 grid-rows-2'
                        }`}>
                        {property.images.slice(0, 4).map((img: string, i: number) => {
                            // Logic for 3 items: Item 0 is row-span-2
                            const isThreeItems = property.images.slice(0, 4).length === 3;
                            let className = "relative h-full w-full rounded-lg overflow-hidden border border-slate-200";

                            if (isThreeItems && i === 0) {
                                className += " row-span-2";
                            }

                            return (
                                <div key={i} className={className}>
                                    <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200">
                        <span className="text-slate-400">Sin imagen disponible</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-12 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-1" style={{ borderColor: secondaryColor }}>Características Principales</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Sup. Cubierta</span>
                            <span className="font-bold text-slate-800">{property.coveredSurface} m²</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Sup. Descubierta</span>
                            <span className="font-bold text-slate-800">{property.uncoveredSurface} m²</span>
                        </div>
                        {property.semiCoveredSurface > 0 && (
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                                <span className="text-slate-600">Sup. Semicubierta</span>
                                <span className="font-bold text-slate-800">{property.semiCoveredSurface} m²</span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Tipo Superficie</span>
                            <span className="font-bold text-slate-800">{property.surfaceType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Sup. Homogenizada</span>
                            <span className="font-bold text-slate-800">{hSurface && hSurface.toFixed(2)} m²</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-1" style={{ borderColor: secondaryColor }}>Detalles y Características</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Ambientes</span>
                            <span className="font-bold text-slate-800">{property.rooms || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Dormitorios</span>
                            <span className="font-bold text-slate-800">{property.bedrooms || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Baños</span>
                            <span className="font-bold text-slate-800">{property.bathrooms || '-'}</span>
                        </div>
                        {property.toilettes > 0 && (
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                                <span className="text-slate-600">Toilettes</span>
                                <span className="font-bold text-slate-800">{property.toilettes}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Antigüedad</span>
                            <span className="font-bold text-slate-800">{property.age ? `${property.age} años` : '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Cochera</span>
                            <span className="font-bold text-slate-800">{property.garage ? 'Sí' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-1" style={{ borderColor: secondaryColor }}>Información Adicional</h3>
                    <div className="space-y-2">
                        {property.floorType && (
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                                <span className="text-slate-600">Pisos</span>
                                <span className="font-bold text-slate-800">{property.floorType}</span>
                            </div>
                        )}
                        {property.apartmentsInBuilding > 0 && (
                            <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                                <span className="text-slate-600">Deptos. en Edificio</span>
                                <span className="font-bold text-slate-800">{property.apartmentsInBuilding}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Apto Crédito</span>
                            <span className="font-bold text-slate-800">{property.isCreditEligible ? 'Sí' : 'No'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Apto Profesional</span>
                            <span className="font-bold text-slate-800">{property.isProfessional ? 'Sí' : 'No'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Financiamiento</span>
                            <span className="font-bold text-slate-800">{property.hasFinancing ? 'Sí' : 'No'}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-1" style={{ borderColor: secondaryColor }}>Análisis de Mercado</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Días en Mercado</span>
                            <span className="font-bold text-slate-800">{property.daysOnMarket}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">$/m² Homogenizado</span>
                            <span className="font-bold text-slate-800">U$S {pricePerM2.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                            <span className="text-slate-600">Factor Homog.</span>
                            <span className="font-bold text-slate-800">{property.homogenizationFactor}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-400">
                <span>Reporte generado el {new Date().toLocaleDateString()}</span>
                <span>Página {index + 4}</span>
            </div>
        </div>
    );
};

export default PropertyDetailPage;
