import React, { useMemo } from 'react';

// Genera datos simulados basados en el tipo de gráfico y violación para el visualizador
function generateChartData(type, violationType, violationPoint, pointsCount, cl, ucl, lcl) {
  const points = [];
  const range = ucl - lcl;
  const sigma = range / 6; // 6 sigmas cubren la distancia LCL a UCL
  
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
  const { type, violationType, violationPoint, pointsCount = 15, cl, ucl, lcl, label = 'Medida' } = chartConfig || {};
  
  // Generar puntos del gráfico principal
  const points = useMemo(() => {
    if (!chartConfig) return [];
    return generateChartData(type, violationType, violationPoint, pointsCount, cl, ucl, lcl);
  }, [chartConfig, type, violationType, violationPoint, pointsCount, cl, ucl, lcl]);
  
  // Determinar si es un gráfico dual (variables: Xbar-R, Xbar-S, I-MR)
  const isDual = type === 'Xbar-R' || type === 'Xbar-S' || type === 'I-MR';
  
  // Generar puntos del gráfico secundario (Rango o Desviación Estándar) si es dual
  const secondaryPoints = useMemo(() => {
    if (!chartConfig || !isDual) return [];
    const sCL = cl * 0.3;
    const sUCL = sCL * 2.2;
    const sLCL = 0;
    return generateChartData(type, 'none', -1, pointsCount, sCL, sUCL, sLCL);
  }, [chartConfig, isDual, type, pointsCount, cl]);
  
  if (!chartConfig) return null;
  
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
    
    const isVariableLimits = (type === 'P' || type === 'U') && panelIndex === 0;
    
    const limitsPoints = (() => {
      if (!isVariableLimits) return null;
      return pList.map((_, idx) => {
        const factor = 1 + 0.15 * Math.sin(idx * 1.5);
        const diffU = upperLimit - centerVal;
        const diffL = centerVal - lowerLimit;
        return {
          ucl: centerVal + diffU * factor,
          lcl: Math.max(0, centerVal - diffL * factor)
        };
      });
    })();
    
    // Generar path para la línea de conexión
    let pathData = '';
    pList.forEach((val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      pathData += `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Título del panel */}
        <text x="15" y="20" fill="#005B96" fontSize="11" fontWeight="bold" fontFamily="Fredoka">
          {title}
        </text>
        
        {/* Rejilla vertical redondeada y amigable */}
        {pList.map((_, idx) => (
          <line
            key={`grid-${idx}`}
            x1={getX(idx)}
            y1={paddingTop}
            x2={getX(idx)}
            y2={paddingTop + chartHeight}
            stroke="rgba(0, 174, 239, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        ))}
        
        {/* Línea Central (CL) */}
        <line
          x1={paddingLeft}
          y1={getY(centerVal)}
          x2={width - paddingRight}
          y2={getY(centerVal)}
          stroke="#00AEEF"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x={width - paddingRight + 5} y={getY(centerVal) + 4} fill="#00AEEF" fontSize="9" fontWeight="bold" fontFamily="Fredoka">
          CL: {centerVal.toFixed(2)}
        </text>
        
        {/* Límites de control (LCS / LCI) */}
        {isVariableLimits ? (
          <>
            {/* Límite Superior Variable */}
            <path
              d={limitsPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.ucl)}`).join(' ')}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <text x={width - paddingRight + 5} y={getY(limitsPoints[limitsPoints.length - 1].ucl) + 4} fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="Fredoka">
              UCL (Var)
            </text>
            
            {/* Límite Inferior Variable */}
            <path
              d={limitsPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.lcl)}`).join(' ')}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <text x={width - paddingRight + 5} y={getY(limitsPoints[limitsPoints.length - 1].lcl) + 4} fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="Fredoka">
              LCL (Var)
            </text>
          </>
        ) : (
          <>
            {/* Límite Superior (UCL) */}
            <line
              x1={paddingLeft}
              y1={getY(upperLimit)}
              x2={width - paddingRight}
              y2={getY(upperLimit)}
              stroke="#EF4444"
              strokeWidth="2"
            />
            <text x={width - paddingRight + 5} y={getY(upperLimit) + 4} fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="Fredoka">
              UCL: {upperLimit.toFixed(2)}
            </text>
            
            {/* Límite Inferior (LCL) */}
            <line
              x1={paddingLeft}
              y1={getY(lowerLimit)}
              x2={width - paddingRight}
              y2={getY(lowerLimit)}
              stroke="#EF4444"
              strokeWidth="2"
            />
            <text x={width - paddingRight + 5} y={getY(lowerLimit) + 4} fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="Fredoka">
              LCL: {lowerLimit.toFixed(2)}
            </text>
          </>
        )}
        
        {/* Línea del proceso */}
        <path d={pathData} fill="none" stroke="#005B96" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Nodos de datos de Caricatura (Sonrientes / Preocupados) */}
        {pList.map((val, idx) => {
          const cx = getX(idx);
          const cy = getY(val);
          
          let isPointViolation = false;
          if (panelIndex === 0) {
            if (violationType === 'out-of-bounds' && idx === violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'shift' && idx >= violationPoint - 8 && idx <= violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'trend' && idx >= violationPoint - 7 && idx <= violationPoint) {
              isPointViolation = true;
            } else if (violationType === 'cycle' && idx >= 2) {
              isPointViolation = true;
            }
          }
          
          return (
            <g key={`point-group-${idx}`} className="cursor-pointer">
              {isPointViolation ? (
                <g>
                  {/* Círculo rojo de alerta caricatura */}
                  <circle cx={cx} cy={cy} r="9" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
                  {/* Ojos sorprendidos o.o */}
                  <circle cx={cx - 3} cy={cy - 2} r="1.5" fill="#ffffff" />
                  <circle cx={cx + 3} cy={cy - 2} r="1.5" fill="#ffffff" />
                  {/* Boca sorprendida o triste */}
                  <circle cx={cx} cy={cy + 3} r="2" fill="#ffffff" />
                  {/* Círculo pulsante de alerta externa */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="14"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                </g>
              ) : (
                <g className="hover:scale-150 transition-transform duration-150" style={{ transformOrigin: `${cx}px ${cy}px` }}>
                  {/* Círculo verde feliz */}
                  <circle cx={cx} cy={cy} r="7.5" fill="#22C55E" stroke="#ffffff" strokeWidth="1.5" />
                  {/* Ojos sonrientes ^.^ */}
                  <circle cx={cx - 2.2} cy={cy - 1.5} r="1" fill="#ffffff" />
                  <circle cx={cx + 2.2} cy={cy - 1.5} r="1" fill="#ffffff" />
                  {/* Boca feliz */}
                  <path d={`M ${cx - 2.5} ${cy + 1.5} Q ${cx} ${cy + 3.5} ${cx + 2.5} ${cy + 1.5}`} stroke="#ffffff" strokeWidth="1" fill="none" />
                </g>
              )}
              <title>{`${label} (Muestra ${idx + 1}): ${val.toFixed(2)}`}</title>
            </g>
          );
        })}
      </svg>
    );
  };
  
  return (
    <div className="flex flex-col gap-3 p-4 bg-blue-50/50 border-2 border-blue-100 rounded-3xl max-w-xl mx-auto shadow-lg">
      <div className="text-center text-sm font-bold text-blue-500 border-b border-blue-100 pb-2 flex justify-between items-center px-1">
        <span className="font-mono">GRAFICADOR SPC JUEGO</span>
        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-bold ${
          violationType === 'none' 
            ? 'bg-green-100 text-green-600 border border-green-200' 
            : 'bg-red-100 text-red-650 border border-red-200'
        }`}>
          {violationType === 'none' ? '✓ Estable' : '⚠ Anomalía!'}
        </span>
      </div>
      
      {/* Panel Superior: Xbar o Individuales */}
      <div className="relative">
        {renderPanel(
          points, 
          cl, 
          ucl, 
          lcl, 
          isDual ? (type === 'I-MR' ? 'DIAGRAMA I (VALORES INDIVIDUALES)' : 'DIAGRAMA X̄ (MEDIA DEL PROCESO)') : `DIAGRAMA ${type}`,
          160,
          0
        )}
      </div>
      
      {/* Panel Inferior: R, S o MR para Gráficos Duales */}
      {isDual && (
        <div className="relative animate-fadeIn">
          {renderPanel(
            secondaryPoints,
            cl * 0.3,
            cl * 0.3 * 2.2,
            0,
            type === 'I-MR' ? 'DIAGRAMA MR (RANGO MÓVIL)' : (type === 'Xbar-R' ? 'DIAGRAMA R (RANGOS)' : 'DIAGRAMA S (DESVIACIONES)'),
            120,
            1
          )}
        </div>
      )}
      
      {/* Leyenda Didáctica de Caricatura */}
      <div className="flex justify-center flex-wrap gap-4 text-[10px] text-slate-500 font-mono pt-1">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-red-500 inline-block"></span>
          <span>Límites (LCS/LCI)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-blue-400 border-t border-dashed inline-block"></span>
          <span>Centro (CL)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
          <span>Estable (:)</span>
        </div>
        {violationType !== 'none' && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
            <span className="text-red-500 font-bold">Inestable (o.o)</span>
          </div>
        )}
      </div>
    </div>
  );
}
