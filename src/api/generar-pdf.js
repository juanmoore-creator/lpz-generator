// Archivo: src/api/generar-pdf.js
// Serverless Function de Next.js para generar PDF
// NOTA: Requiere instalar 'pdfkit' para esta implementación simplificada de PDF binario.
// Si quiere usar HTML complejo, se requiere 'puppeteer-core' y 'chrome-aws-lambda' en Vercel.

// Importación para generar PDF binario (simulación de motor PDF)
const PDFDocument = require('pdfkit'); 
const { Writable } = require('stream');

// Variables de Entorno (como en la implementación anterior)
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; 

// --------------------------------------------------------------------------------
// 1. Lógica para generar el contenido HTML (Usando Gemini para la plantilla)
// --------------------------------------------------------------------------------
const generateHtmlContent = async (allDataForAPI) => {
    // Definición de la persona y el formato para la IA, simulando un motor de plantillas.
    const systemPrompt = `Actúa como un motor de plantillas que genera el contenido de un Reporte Comparativo de Mercado. Usa el azul índigo como color principal.
    Genera SOLO el contenido de la portada (Página 1), resumen de promedios (Página 2) y la tabla de comparables (Página 3). No incluyas <head>, <body>, <html> ni estilos de impresión, solo el contenido estructurado que se incrustará.
    Utiliza HTML y clases de utilidad sencillas (ej. 'header', 'section', 'table').
    Devuelve SOLO el HTML, sin explicaciones.`;

    const userQuery = `
        Genera el contenido del reporte (portada, resumen, tabla de comparables) con el siguiente objeto de datos JSON:
        ${JSON.stringify(allDataForAPI, null, 2)}
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    
    // ... Lógica de llamada a la API con backoff (Omitida por brevedad, pero es la misma que antes) ...
    // ... Implemente la lógica de fetch y reintento aquí ...

    let response;
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (error) {
        console.error("Error en la llamada a Gemini:", error);
        throw new Error(`Error en la Serverless Function al generar HTML: ${error.message}`);
    }
};

// --------------------------------------------------------------------------------
// 2. Lógica para generar el PDF (Usando PDFKit - Simulación de Puppeteer)
// --------------------------------------------------------------------------------

const generatePdfBuffer = async (contentHtml, agente, promedios) => {
    // Esta es una simulación de PDFKit. Para Puppeteer, el flujo es diferente.
    // PDFKit simplemente genera un documento basado en texto y formas.

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffer = [];

        // Clase Buffer para recolectar los datos binarios del PDF
        class BufferWritable extends Writable {
            _write(chunk, encoding, callback) {
                buffer.push(chunk);
                callback();
            }
            _final(callback) {
                resolve(Buffer.concat(buffer));
                callback();
            }
        }
        
        doc.pipe(new BufferWritable());

        // --- Estructura del PDF ---
        
        // 1. Portada
        doc.fillColor('#4f46e5').fontSize(30).text('LPZ BIENES RAÍCES', { align: 'center' });
        doc.fillColor('#333').fontSize(20).text('Reporte Comparativo de Mercado (RCM)', { align: 'center' });
        doc.moveDown(4);
        doc.fontSize(14).text(`Generado para la propiedad: ${promedios.propiedadPrincipal.ubicacion || 'Sin Ubicación'}`);
        doc.moveDown(1).fontSize(12).text(`Tipo: ${promedios.propiedadPrincipal.tipo_inmueble} en ${promedios.propiedadPrincipal.tipo_operacion}`);

        doc.moveDown(2).fillColor('#4f46e5').fontSize(16).text('Resumen de Datos Principales:', { underline: true });
        doc.moveDown(0.5).fillColor('#333').fontSize(12)
           .text(`Superficie Total: ${promedios.propiedadPrincipal.superficie_total_m2} m²`)
           .text(`Dormitorios: ${promedios.propiedadPrincipal.dormitorios}`);

        doc.moveDown().text(`Fecha de Generación: ${new Date().toLocaleDateString('es-AR')}`);
        doc.addPage();
        
        // 2. Contenido generado por la IA (asumiendo que es HTML simple, lo pasamos como texto)
        doc.fillColor('#4f46e5').fontSize(20).text('Análisis de Mercado y Comparables', { underline: true });
        doc.moveDown(1);
        doc.fillColor('#333').fontSize(10).text(contentHtml, { 
            // Esto solo es para PDFKit; con Puppeteer, el HTML se renderiza completo.
            align: 'left',
            indent: 10,
            lineGap: 5,
        }); 

        // 3. Página de Contacto
        doc.addPage();
        doc.fillColor('#4f46e5').fontSize(24).text('Datos de Contacto del Agente', { align: 'center' });
        doc.moveDown(2).fillColor('#333').fontSize(14)
           .text(`Agente: ${agente.nombre}`)
           .text(`Teléfono: ${agente.telefono}`)
           .text(`Email: ${agente.email}`)
           .text(`Matrícula: ${agente.matricula}`);

        doc.end();
    });
};


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'GEMINI_API_KEY no configurada en las variables de entorno de Vercel.' });
    }

    try {
        const allData = req.body;
        
        // 1. Generar Contenido (Usando Gemini como motor de plantillas)
        const contentHtml = await generateHtmlContent(allData);

        // 2. Generar el PDF Binario (Simulando Puppeteer con PDFKit)
        // Pasamos todos los datos necesarios para recrear el reporte en el PDF.
        const pdfBuffer = await generatePdfBuffer(contentHtml, allData.agente, {
             propiedadPrincipal: allData.propiedadPrincipal,
             promedios: allData.promedios 
        });

        // 3. Forzar Descarga (Cabeceras HTTP)
        // Se envía la respuesta binaria
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_LPZ_BIENES_RAICES.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('Error en la Serverless Function:', error);
        res.status(error.status || 500).json({ 
            message: 'Error al generar el reporte en el servidor.', 
            details: error.message 
        });
    }
}
