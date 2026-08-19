import React, { useState } from 'react';
import { Terminal, X, Clipboard, Check, Trash2 } from 'lucide-react';

export default function DebugLogsDrawer({ logs, isOpen, onClose, onClear }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = logs.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex justify-end items-end sm:items-center p-4">
      {/* Cierre haciendo clic afuera */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Tarjeta de Consola */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] border-2 border-blue-100 relative z-10 animate-float">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <h3 className="font-mono font-black text-xs text-blue-500 uppercase tracking-wider">
              Consola de Depuración
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botón copiar */}
            <button
              onClick={handleCopyLogs}
              disabled={logs.length === 0}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-500 rounded-xl transition-all"
              title="Copiar registros"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>

            {/* Botón limpiar */}
            {onClear && (
              <button
                onClick={onClear}
                disabled={logs.length === 0}
                className="p-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-500 rounded-xl transition-all"
                title="Limpiar consola"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
              title="Cerrar consola"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cuerpo de Logs */}
        <div className="flex-1 overflow-y-auto font-mono text-[9px] bg-gray-950 text-emerald-400 p-4 rounded-2xl space-y-1.5 select-text border-2 border-gray-900 shadow-inner max-h-[50vh]">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center py-8">
              No hay registros de red o depuración acumulados.
            </div>
          ) : (
            logs.map((log, idx) => {
              // Colorear logs según nivel de gravedad: ERROR, WARN, INFO
              let color = 'text-emerald-400';
              if (log.includes('[ERROR]') || log.toLowerCase().includes('error')) {
                color = 'text-rose-400 font-bold';
              } else if (log.includes('[WARN]') || log.toLowerCase().includes('advertencia')) {
                color = 'text-amber-300';
              } else if (log.includes('[SYSTEM]')) {
                color = 'text-blue-300';
              }

              return (
                <div key={idx} className={`whitespace-pre-wrap leading-relaxed border-b border-slate-900 pb-1.5 ${color}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>

        {/* Pie informativo */}
        <div className="mt-3 text-center">
          <span className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            SPC Battle Arena • Monitoreo en Tiempo Real
          </span>
        </div>

      </div>
    </div>
  );
}
