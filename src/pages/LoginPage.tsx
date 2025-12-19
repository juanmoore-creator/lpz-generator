import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Home, Loader2, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
    const { login, user, resetPassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isReset, setIsReset] = useState(false);

    if (user) {
        return <Navigate to="/app" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isReset) {
                await resetPassword(email);
                alert('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
                setIsReset(false);
            } else {
                await login(email, password);
                navigate('/app');
            }
        } catch (error: any) {
            console.error("Authentication failed", error);
            let msg = "Error de autenticación.";
            if (error.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
            if (error.code === 'auth/user-not-found') msg = "No existe una cuenta con este correo.";
            if (error.code === 'auth/invalid-email') msg = "El correo electrónico no es válido.";
            if (error.code === 'auth/too-many-requests') msg = "Demasiados intentos fallidos. Inténtalo más tarde.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-brand p-3 rounded-xl shadow-lg shadow-brand/20">
                            <Home className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">
                        {isReset ? 'Recuperar Contraseña' : 'Bienvenido'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Lopez Bienes Raíces - Panel Administrativo
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    {!isReset && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            isReset ? 'Enviar Link' : 'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsReset(!isReset)}
                        className="text-sm text-brand hover:text-brand-dark hover:underline transition-colors"
                    >
                        {isReset ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
