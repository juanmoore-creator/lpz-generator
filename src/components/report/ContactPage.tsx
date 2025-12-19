

const ContactPage = ({ data, theme }: { data: any, theme?: { primary: string, secondary: string } }) => {
    const primaryColor = theme?.primary || '#1e293b';

    return (
        <div className="print-page h-[1123px] w-[794px] bg-white p-12 flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-12" style={{ color: primaryColor }}>Lopez Bienes Raíces</h2>

            <div className="space-y-4 text-lg text-slate-700">
                <p><strong>Corredor Responsable:</strong> {data.brokerName || 'Nombre del Agente'}</p>
                <p><strong>Matrícula:</strong> {data.matricula || 'XXXX'}</p>
                <p><strong>Dirección:</strong> Calle 48 N°928/930 e 13 y 14</p>
                <p><strong>Teléfono:</strong> +54 9 221 6834820</p>
                <p><strong>Email:</strong> lpz.bienesraices@gmail.com</p>
                <p><strong>Web:</strong> https://www.lpzbienesraices.com.ar/</p>
            </div>

            <div className="mt-20 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                <p>
                    <strong>Aviso Legal:</strong> La presente tasación es una estimación de valor de mercado basada en comparables
                    y análisis profesional. No constituye una tasación bancaria oficial ni garantiza el precio final de venta.
                    Los valores pueden variar según las condiciones del mercado. TTasaciones no se responsabiliza por
                    decisiones tomadas basadas únicamente en este reporte sin asesoramiento adicional.
                </p>
            </div>
        </div>
    );
};

export default ContactPage;
