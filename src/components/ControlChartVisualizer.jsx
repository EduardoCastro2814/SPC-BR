import React, { useMemo } from 'react';

// Genera datos simulados basados en el tipo de gráfico y violación para el visualizador
function generateChartData(type, violationType, violationPoint, pointsCount, cl, ucl, lcl) {
  const points = [];
  const range = ucl - lcl;
  const sigma = range / 6; // 6 sigmas cubren la distancia LCL a UCL
  
  let currentMean = cl;
  
  for (let i = 0; i < pointsCount; i++) {
    let val = cl;
    
    if (violationType === 'out-of-bounds' && i === violationPoint) {
      // Forzar punto fuera de límites (superior)
      val = ucl + sigma * (1.2 + Math.random() * 0.8);
    } else if (violationType === 'shift' && i >= violationPoint - 8 && i <= violationPoint) {
      // Desplazamiento hacia arriba de la media
      val = cl + sigma * 1.8 + (Math.random() - 0.5) * sigma;
    } else if (violationType === 'trend' && i >= violationPoint - 7 && i <= violationPoint) {
      // Tendencia ascendente progresiva
      const step = (i - (violationPoint - 7));
      val = cl - sigma * 1.5 + (step * (sigma * 0.55)) + (Math.random() - 0.5) * (sigma * 0.2);
    } else if (violationType === 'cycle') {
      // Ciclo alternante arriba y abajo
      const isEven = i % 2 === 0;
      val = cl + (isEven ? sigma * 1.5 : -sigma * 1.5) + (Math.random() - 0.5) * (sigma * 0.3);
    } else {
      // Variación común aleatoria (Normal)
      val = cl + (Math.random() + Math.random() + Math.random() - 1.5) * 1.2 * sigma;
    }
    
    // Recortar límites prácticos
    if (val < 0 && (type === 'P' || type === 'NP' || type === 'C' || type === 'U')) {
      val = 0;
    }
    
    points.push(val);
  }
  
  return points;
}

export default function ControlChartVisualizer({ chartConfig }) {
  if (!chartConfig) return null;
  
  const { type, violationType, violationPoint, pointsCount = 15, cl, ucl, lcl, label = 'Medida' } = chartConfig;
  
  // Generar puntos del gráfico principal
  const points = useMemo(() => {
    return generateChartData(type, violationType, violationPoint, pointsCount, cl, ucl, lcl);
  }, [type, violationType, violationPoint, pointsCount, cl, ucl, lcl]);
  
  // Determinar si es un gráfico dual (variables: Xbar-R, Xbar-S, I-MR)
  const isDual = type === 'Xbar-R' || type === 'Xbar-S' || type === 'I-MR';
  
  // Generar puntos del gráfico secundario (Rango o Desviación Estándar) si es dual
  const secondaryPoints = useMemo(() => {
    if (!isDual) return [];
    // El gráfico secundario suele ser estable excepto en el caso de variabilidad aumentada
    const sCL = cl * 0.3;
    const sUCL = sCL * 2.2;
    const sLCL = 0;
    return generateChartData(type, 'none', -1, pointsCount, sCL, sUCL, sLCL);
  }, [isDual, type, pointsCount, cl]);
  
  // Renderizar un panel de gráfico individual
  const renderPanel = (pList, centerVal, upperLimit, lowerLimit, title, height = 150, panelIndex = 0) => {
    const width = 500;
    const paddingLeft = 55;
    const paddingRight = 60;
    const paddingTop = 25;
    const paddingBottom = 25;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    // Obtener valores mínimos y máximos para el escalado vertical
    const maxVal = Math.max(...pList, upperLimit) * 1.15;
    const minVal = Math.min(...pList, lowerLimit) * 0.85;
    const valRange = maxVal - minVal || 1;
    
    const getX = (index) => paddingLeft + (index / (pointsCount - 1)) * chartWidth;
    const getY = (val) => paddingTop + chartHeight - ((val - minVal) / valRange) * chartHeight;
    
    // Límites de control variables (por ejemplo para gráfico P/U con muestra variable)
    const isVariableLimits = (type === 'P' || type === 'U') && panelIndex === 0;
    
    const limitsPoints = useMemo(() => {
      if (!isVariableLimits) return null;
      // Simular límites que fluctúan levemente por subgrupo
      return pList.map((_, idx) => {
        const factor = 1 + 0.15 * Math.sin(idx * 1.5); // simular variación del tamaño de muestra
        const diffU = upperLimit - centerVal;
        const diffL = centerVal - lowerLimit;
        return {
          ucl: centerVal + diffU * factor,
          lcl: Math.max(0, centerVal - diffL * factor)
        };
      });
    }, [isVariableLimits, pList, upperLimit, lowerLimit, centerVal]);
    
    // Generar path para la línea de conexión
    let pathData = '';
    pList.forEach((val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      pathData += `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-gray-900 border border-gray-800 rounded-md overflow-hidden shadow-inner">
        {/* Título de gráfico */}
        <text x="15" y="20" fill="#9ca3af" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {title}
        </text>
        
        {/* Rejilla de fondo vertical */}
        {pList.map((_, idx) => (
          <line
            key={`grid-${idx}`}
            x1={getX(idx)}
            y1={paddingTop}
            x2={getX(idx)}
            y2={paddingTop + chartHeight}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
          />
        ))}
        
        {/* Línea Central (CL) */}
        <line
          x1={paddingLeft}
          y1={getY(centerVal)}
          x2={width - paddingRight}
          y2={getY(centerVal)}
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text x={width - paddingRight + 5} y={getY(centerVal) + 4} fill="#60a5fa" fontSize="9" fontWeight="bold" fontFamily="monospace">
          CL: {centerVal.toFixed(2)}
        </text>
        
        {/* Límites de control (LCS / LCI) */}
        {isVariableLimits ? (
          // Dibujar límites escalonados variables
          <>
            {/* Límite Superior Variable */}
            <path
              d={limitsPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.ucl)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text x={width - paddingRight + 5} y={getY(limitsPoints[limitsPoints.length - 1].ucl) + 4} fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
              UCL (Var)
            </text>
            
            {/* Límite Inferior Variable */}
            <path
              d={limitsPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.lcl)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text x={width - paddingRight + 5} y={getY(limitsPoints[limitsPoints.length - 1].lcl) + 4} fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
              LCL (Var)
            </text>
          </>
        ) : (
          // Límites estándar constantes
          <>
            {/* Límite Superior (UCL) */}
            <line
              x1={paddingLeft}
              y1={getY(upperLimit)}
              x2={width - paddingRight}
              y2={getY(upperLimit)}
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <text x={width - paddingRight + 5} y={getY(upperLimit) + 4} fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
              UCL: {upperLimit.toFixed(2)}
            </text>
            
            {/* Límite Inferior (LCL) */}
            <line
              x1={paddingLeft}
              y1={getY(lowerLimit)}
              x2={width - paddingRight}
              y2={getY(lowerLimit)}
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <text x={width - paddingRight + 5} y={getY(lowerLimit) + 4} fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
              LCL: {lowerLimit.toFixed(2)}
            </text>
          </>
        )}
        
        {/* Línea que conecta los puntos del proceso */}
        <path d={pathData} fill="none" stroke="#06b6d4" strokeWidth="2" className="shadow-lg" />
        
        {/* Nodos de datos */}
        {pList.map((val, idx) => {
          const cx = getX(idx);
          const cy = getY(val);
          
          // Verificar si el punto infringe alguna regla en este panel
          let isPointViolation = false;
          if (panelIndex === 0) { // Las violaciones de las preguntas se programan en el panel principal
            if (violationType === 'out-of-bounds' && idx === violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'shift' && idx >= violationPoint - 8 && idx <= violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'trend' && idx >= violationPoint - 7 && idx <= violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'cycle' && idx >= 2) {
              isPointViolation = true; // resaltar el comportamiento cíclico
            }
          }
          
          return (
            <g key={`point-group-${idx}`}>
              {isPointViolation ? (
                <>
                  {/* Círculo pulsante de alerta */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                  <circle cx={cx} cy={cy} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                </>
              ) : (
                <circle cx={cx} cy={cy} r="4" fill="#06b6d4" stroke="#111827" strokeWidth="1.5" className="hover:scale-150 transition-transform duration-100 cursor-pointer" />
              )}
              {/* Etiqueta flotante con el valor */}
              <title>{`${label} (Muestra ${idx + 1}): ${val.toFixed(2)}`}</title>
            </g>
          );
        })}
      </svg>
    );
  };
  
  return (
    <div className="flex flex-col gap-3 p-3 bg-gray-950 border border-gray-800 rounded-lg max-w-xl mx-auto shadow-xl">
      <div className="text-center text-xs font-bold text-blue-400 border-b border-gray-800 pb-2 flex justify-between items-center px-1">
        <span>GRÁFICO DE CONTROL: {type}</span>
        <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
          {violationType === 'none' ? 'Estable' : 'Anomalía Detectada'}
        </span>
      </div>
      
      {/* Panel Superior: Xbar o Individuales */}
      <div className="relative">
        {renderPanel(
          points, 
          cl, 
          ucl, 
          lcl, 
          isDual ? (type === 'I-MR' ? 'GRÁFICO I (INDIVIDUALES)' : 'GRÁFICO X̄ (PROMEDIOS)') : `GRÁFICO ${type}`,
          160,
          0
        )}
      </div>
      
      {/* Panel Inferior: R, S o MR para Gráficos Duales */}
      {isDual && (
        <div className="relative">
          {renderPanel(
            secondaryPoints,
            cl * 0.3, // CL del rango aproximado
            cl * 0.3 * 2.2, // UCL del rango aproximado
            0, // LCL
            type === 'I-MR' ? 'GRÁFICO MR (RANGO MÓVIL)' : (type === 'Xbar-R' ? 'GRÁFICO R (RANGOS)' : 'GRÁFICO S (DESVIACIONES)'),
            120,
            1
          )}
        </div>
      )}
      
      {/* Glosario de ayuda en miniatura */}
      <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-mono pt-1">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-red-500 inline-block"></span>
          <span>Límites (UCL/LCL)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-blue-500 border-t border-dashed inline-block"></span>
          <span>Media (CL)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
          <span>Proceso</span>
        </div>
        {violationType !== 'none' && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
            <span className="text-red-400 font-bold">Inestabilidad</span>
          </div>
        )}
      </div>
    </div>
  );
}
