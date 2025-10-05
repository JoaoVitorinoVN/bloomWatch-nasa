// src/components/GrowthChart.tsx
'use client';

import { useMemo } from 'react';

export default function GrowthChart({
                                        totalDays,
                                        daysUntilBloom,
                                        width = 360,
                                        height = 120,
                                    }: {
    totalDays: number;
    daysUntilBloom?: number | null;
    width?: number;
    height?: number;
}) {
    const progress = useMemo(() => {
        if (!totalDays || totalDays <= 0) return 0;
        if (daysUntilBloom == null) return 0.5; // sem dado: meio do caminho
        const done = Math.max(0, totalDays - daysUntilBloom);
        return Math.max(0, Math.min(1, done / totalDays));
    }, [totalDays, daysUntilBloom]);

    const pad = 16;
    const W = width - pad * 2;
    const H = height - pad * 2;

    // curva suave de crescimento (bézier simples)
    const x0 = pad, y0 = height - pad;
    const x1 = pad + W * 0.33, y1 = pad + H * 0.66;
    const x2 = pad + W * 0.66, y2 = pad + H * 0.33;
    const x3 = pad + W, y3 = pad;

    const todayX = pad + W * progress;
    const todayY = pad + H * (1 - progress); // só para “desenhar” perto da curva

    return (
        <svg width={width} height={height} role="img" aria-label="Gráfico de crescimento">
            <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
            </defs>

            {/* fundo sutil */}
            <rect x={0} y={0} width={width} height={height} rx={12}
                  fill="rgba(255,255,255,.06)" />

            {/* curva */}
            <path
                d={`M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`}
                fill="none" stroke="url(#gc)" strokeWidth={4}
            />

            {/* eixo basal */}
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad}
                  stroke="rgba(64,38,19,.25)" strokeWidth={1} />

            {/* marcador “hoje” */}
            <line x1={todayX} y1={pad} x2={todayX} y2={height - pad}
                  stroke="rgba(64,38,19,.35)" strokeDasharray="4 4" />
            <circle cx={todayX} cy={todayY} r={6} fill="#3b82f6" stroke="white" strokeWidth={2} />

            {/* legendas */}
            <text x={pad} y={height - 2} fontSize="11" fill="#402613">0d</text>
            <text x={width - pad - 18} y={height - 2} fontSize="11" fill="#402613">{totalDays}d</text>
            <text x={todayX + 8} y={todayY - 8} fontSize="11" fill="#402613">
                {Math.round(progress * totalDays)} d
            </text>
        </svg>
    );
}
