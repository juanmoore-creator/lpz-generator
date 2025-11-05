// Archivo: src/api/generar-pdf.js
// IMPLEMENTACIÓN REAL DE GENERACIÓN DE PDF USANDO PUPPETEER EN VERCELL
// Requiere instalar 'puppeteer-core' y 'chrome-aws-lambda'

const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

// Variables de Entorno
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; 

// Ruta al ejecutable de Chrome (específica para el entorno Vercel/Lambda)
const EXE_PATH = process.env.NODE_ENV === 'production'
    ? '/usr/bin/google-chrome' // Ruta común en entornos sin servidor como Vercel/Lambda
    : puppeteer.executablePath(); // Ruta para desarrollo local

// --------------------------------------------------------------------------------
// 1. Lógica para generar el contenido HTML (Usando Gemini para la plantilla)
// --------------------------------------------------------------------------------
const generateHtmlContent = async (allDataForAPI) => {
    // La prompt de Gemini se mantiene: pide HTML/CSS completo listo para PDF
    const systemPrompt = `Actúa como un motor de plantillas que genera un archivo HTML/CSS completo y profesional, diseñado específicamente para ser convertido a PDF (tamaño A4). NO uses Tailwind CSS. Usa CSS puro dentro de una etiqueta <style>. Incluye un <head> y un <body>. Incluye un gráfico Chart.js que mapee Precio Publicación vs. Superficie Total usando los datos de las propiedades comparables. Usa la clase CSS 'page-break' para forzar saltos de página entre secciones principales (Portada, Análisis, Detalle Comparables). Devuelve SOLO el código HTML completo.`;

    const userQuery = `
        Genera el Reporte Comparativo de Mercado con el siguiente objeto de datos JSON:
        ${JSON.stringify(allDataForAPI, null, 2)}
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    
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
        console.error("Error en la llamada a Gemini para HTML:", error);
        throw new Error(`Error en la Serverless Function al generar HTML: ${error.message}`);
    }
};

// --------------------------------------------------------------------------------
// 2. Lógica para generar el PDF (USANDO PUPPETEER)
// --------------------------------------------------------------------------------

const generatePdfBuffer = async (contentHtml) => {
    let browser = null;
    let pdfBuffer = null;

    try {
        // 1. Lanzar el navegador
        browser = await puppeteer.launch({
            args: chrome.args,
            executablePath: await chrome.executablePath, // Usa chrome-aws-lambda para la ruta
            headless: chrome.headless,
        });

        const page = await browser.newPage();
        
        // 2. Cargar el HTML (que ya incluye CSS y Chart.js)
        await page.setContent(contentHtml, {
            waitUntil: 'networkidle0', // Espera a que la red esté inactiva (incluyendo la carga de Chart.js)
        });

        // 3. Generar el PDF
        pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Importante para renderizar colores y fondos
            // Márgenes adaptados para un reporte
            margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm',
            },
            // Aquí es donde se usan los selectores de Gemini para forzar saltos
            displayHeaderFooter: false 
        });

    } catch (error) {
        console.error('Error de Puppeteer:', error);
        throw new Error(`Fallo en la conversión a PDF con Puppeteer: ${error.message}`);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
    
    return pdfBuffer;
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
        
        // 1. Generar Contenido HTML (Gemini)
        const contentHtml = await generateHtmlContent(allData);

        // 2. Generar el PDF Binario (Puppeteer)
        const pdfBuffer = await generatePdfBuffer(contentHtml);

        // 3. Forzar Descarga (Cabeceras HTTP)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_LPZ_BIENES_RAICES.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Enviamos el Buffer binario directamente al cliente
        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('Error en la Serverless Function:', error);
        // Devolvemos el error en formato JSON para que el cliente pueda leerlo
        res.status(error.status || 500).json({ 
            message: 'Error al generar el reporte en el servidor.', 
            details: error.message 
        });
    }
}
