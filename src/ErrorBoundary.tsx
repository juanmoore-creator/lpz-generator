import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 border border-red-100">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Algo salió mal</h2>
                        <p className="text-slate-600 mb-4 text-sm">La aplicación ha encontrado un error inesperado.</p>
                        <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-700 overflow-auto max-h-32 mb-4">
                            {this.state.error?.message}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
