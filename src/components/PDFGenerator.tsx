import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReportView from './ReportView';
import { Download } from 'lucide-react';

interface PDFGeneratorProps {
    target: any;
    comparables: any[];
    valuation: any;
    stats: any;
    brokerName?: string;
    matricula?: string;
    theme?: {
        primary: string;
        secondary: string;
    };
}

const PDFGenerator = ({ target, comparables, valuation, stats, brokerName, matricula, theme }: PDFGeneratorProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setMountNode(document.body);
    }, []);

    const handleGeneratePDF = async () => {
        setIsGenerating(true);

        try {
            // Lazy load libraries only when needed
            const [html2canvas, jsPDF] = await Promise.all([
                import('html2canvas').then(m => m.default),
                import('jspdf').then(m => m.default)
            ]);

            // Wait a tick for React to render the portal content if it wasn't there (though we keep it mounted now)
            await new Promise(resolve => setTimeout(resolve, 100));

            const container = document.getElementById('pdf-render-target');
            if (!container) throw new Error("Container not found");

            const pages = container.querySelectorAll('.print-page');
            if (pages.length === 0) throw new Error("No pages found");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;
                const canvas = await html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: 794,
                    windowWidth: 794,
                    height: 1123,
                    windowHeight: 1123,
                    onclone: (clonedDoc) => {
                        // Ensure cloned element is visible
                        const clonedPage = clonedDoc.getElementById('pdf-render-target');
                        if (clonedPage) {
                            clonedPage.style.display = 'block';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.8);

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`tasacion-${target.address || 'propiedad'}.pdf`);
        } catch (err) {
            console.error("Error generating PDF", err);
            alert("Hubo un error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Prepare report data
    const reportData = {
        target: target,
        brokerName: brokerName || 'Usuario TTasaciones',
        matricula: matricula || '',
        clientName: 'Cliente Final',
        ...valuation
    };

    return (
        <>
            <button
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-200 hover:shadow-md rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
                disabled={isGenerating || comparables.length === 0}
            >
                {isGenerating ? (
                    'Generando...'
                ) : (
                    <>
                        <Download className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
                    </>
                )}
            </button>

            {/* Render Portal directly to body to avoid layout issues */}
            {mountNode && createPortal(
                <div id="pdf-render-target" style={{
                    position: 'fixed',
                    left: '-10000px',
                    top: 0,
                    width: '794px',
                    zIndex: -9999,
                    visibility: 'hidden', // Use visibility instead of display:none
                    pointerEvents: 'none'
                }}>
                    {/*
                       We render the ReportView ALWAYS so it's ready for capture.
                       visibility:hidden allows html2canvas to capture it (it ignores visibility usually, or we can toggle it).
                       Actually, html2canvas needs it to be rendered.
                       Let's use a technique: visible but off-screen.
                     */}
                    <div style={{ visibility: 'visible' }}>
                        <ReportView
                            data={reportData}
                            properties={comparables}
                            valuation={valuation}
                            stats={stats}
                            theme={theme}
                        />
                    </div>
                </div>,
                mountNode
            )}
        </>
    );
};

export default PDFGenerator;
