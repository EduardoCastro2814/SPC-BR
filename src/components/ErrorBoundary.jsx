import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Error atrapado en el componente hijo:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-rose-600 font-mono space-y-4 bg-rose-50/50 border-2 border-rose-100 rounded-3xl max-w-sm mx-auto">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-sm font-black uppercase">Falla Crítica en Consola</h2>
          <p className="text-[11px] text-slate-600 font-bold leading-relaxed px-2">
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('spc_player_id');
              sessionStorage.removeItem('spc_player_game_id');
              sessionStorage.removeItem('spc_player_name');
              window.location.reload();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-[10px] uppercase rounded-xl transition-all active:scale-95 shadow-md shadow-rose-200"
          >
            Limpiar Sesión y Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
