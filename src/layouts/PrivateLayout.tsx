import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivateLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand p-1.5 rounded-lg">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-heading font-bold text-xl text-gray-800">
                            Lopez <span className="text-brand">Bienes Raíces</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:block">
                            {user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors p-2 rounded-lg hover:bg-gray-100"
                            title="Cerrar Sessión"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default PrivateLayout;
