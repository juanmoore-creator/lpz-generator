import { motion } from 'framer-motion';
import { ChevronRight, FileCheck, Zap, Shield, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-neutral-950/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">TTasaciones</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/app')}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate('/app')}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                            Comenzar Gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Nueva funcionalidad de PDF disponible
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"
                    >
                        Tasaciones profesionales, <br />
                        <span className="text-indigo-500">en segundos.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Genera reportes PDF detallados, analiza el mercado y gestiona tus propiedades con la herramienta más potente para agentes inmobiliarios.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/app')}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-950 font-bold rounded-full transition-all hover:bg-gray-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Empezar ahora <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full border border-white/10 hover:bg-white/10 transition-all">
                            Ver demo
                        </button>
                    </motion.div>

                    {/* Abstract Interface Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-20 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-4 shadow-2xl shadow-indigo-500/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-xl pointer-events-none" />
                        <div className="aspect-[16/9] rounded-lg bg-neutral-950 border border-white/5 overflow-hidden flex items-center justify-center relative">
                            {/* Mock UI Elements */}
                            <div className="absolute inset-0 flex flex-col p-8 opacity-50">
                                <div className="h-8 w-1/3 bg-white/10 rounded mb-8"></div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="h-32 bg-white/5 rounded"></div>
                                    <div className="h-32 bg-white/5 rounded"></div>
                                    <div className="h-32 bg-white/5 rounded"></div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded mt-4"></div>
                            </div>
                            <div className="z-10 bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-2xl text-center">
                                <FileCheck className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Reporte Generado</h3>
                                <p className="text-sm text-gray-400">Tu tasación está lista para descargar.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Todo lo que necesitas</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Herramientas diseñadas específicamente para optimizar tu flujo de trabajo inmobiliario.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Análisis Instantáneo", desc: "Obtén valoraciones de mercado basadas en datos reales en cuestión de segundos." },
                            { icon: FileCheck, title: "Reportes PDF", desc: "Genera documentos profesionales con tu marca listos para enviar a clientes." },
                            { icon: Shield, title: "Datos Seguros", desc: "Tus tasaciones y datos de clientes están encriptados y seguros." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors">
                                    <feature.icon className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 border-t border-white/5 bg-neutral-950 relative">
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Planes Simples</h2>
                        <p className="text-gray-400">Sin comisiones ocultas. Cancela cuando quieras.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="p-8 rounded-3xl bg-neutral-900 border border-white/10">
                            <h3 className="text-2xl font-bold mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-400">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-indigo-500" /> 5 Tasaciones mensuales</li>
                                <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-indigo-500" /> Reportes básicos</li>
                                <li className="flex items-center gap-3 text-gray-300"><Check className="w-5 h-5 text-indigo-500" /> Acceso a datos de mercado</li>
                            </ul>
                            <button onClick={() => navigate('/app')} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                                Comenzar Gratis
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 rounded-3xl bg-neutral-900 border border-indigo-500/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                            <h3 className="text-2xl font-bold mb-2">Pro Agency</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold">$29</span>
                                <span className="text-gray-400">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 text-indigo-400" /> Tasaciones ilimitadas</li>
                                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 text-indigo-400" /> PDF Personalizados (Logo propio)</li>
                                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 text-indigo-400" /> Soporte prioritario</li>
                                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 text-indigo-400" /> Análisis histórico</li>
                            </ul>
                            <button onClick={() => navigate('/app')} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all">
                                Obtener Pro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-neutral-950 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} TTasaciones. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
