'use client'

import { CSSProperties, useMemo } from 'react'

type Props = {
    size?: number
    sun?: number   // 0–100
    rain?: number  // 0–100
    wind?: number  // 0–100
}

export default function FlowerHero({ size = 220, sun = 50, rain = 10, wind = 10 }: Props) {
    // clamps e normalizações
    const clamp = (v:number) => Math.min(Math.max(v, 0), 100)
    const sunN  = clamp(sun)  / 100
    const rainN = clamp(rain) / 100
    const windN = clamp(wind) / 100
    const round = (n:number) => +n.toFixed(3)

    // parâmetros visuais
    const ampDeg     = (1 + windN * 9).toFixed(2) + 'deg'                 // amplitude do balanço
    const speedS     = Math.max(1.2, 4 - windN * 3).toFixed(2) + 's'      // mais vento → mais rápido
    const sunSat     = (0.9 + sunN * 0.9).toFixed(2)                      // saturação
    const sunBright  = (0.9 + sunN * 0.35).toFixed(2)                     // brilho
    const rayOpacity = (0.15 + sunN * 0.85).toFixed(2)
    const droop      = rainN > 0.6 ? (rainN - 0.6) * 20 : (sunN < 0.25 ? (sunN - 0.25) * 20 : 0)
    const gustOpacity = windN > 0.3 ? (windN - 0.3) / 0.7 : 0

    const vars = useMemo(
        () => ({ '--amp': ampDeg, '--speed': speedS } as CSSProperties),
        [ampDeg, speedS]
    )

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            role="img"
            aria-label="Flor reativa ao clima"
            className="drop-shadow-xl"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <radialGradient id="petal" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="100%" stopColor="#ef4444" />
                </radialGradient>
                <radialGradient id="center" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
                <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#065f46" />
                </linearGradient>

                <style>{`
          /* balanço controlado por variáveis CSS */
          .sway { transform-origin: 100px 105px; animation: sway var(--speed,4s) ease-in-out infinite; }
          @keyframes sway {
            0%   { transform: rotate(calc(var(--amp, 1deg) * -1)); }
            50%  { transform: rotate(var(--amp, 1deg)); }
            100% { transform: rotate(calc(var(--amp, 1deg) * -1)); }
          }

          /* gotas de chuva */
          .drop { animation: fall linear infinite; }
          @keyframes fall {
            0%   { transform: translateY(-20px); opacity: 0; }
            10%  { opacity: 1; }
            100% { transform: translateY(90px); opacity: 0; }
          }

          /* filetes de vento */
          .gust { animation: gust 2.8s linear infinite; }
          @keyframes gust {
            from { transform: translateX(-40px); opacity: 0; }
            20%  { opacity: 1; }
            to   { transform: translateX(140px); opacity: 0; }
          }

          /* respeita prefers-reduced-motion */
          @media (prefers-reduced-motion: reduce) {
            .sway, .drop, .gust, .rayPulse { animation: none !important; }
          }

          .rayPulse { animation: ray 4s ease-in-out infinite; transform-origin: 50px 45px; }
          @keyframes ray { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `}</style>
            </defs>

            {/* SOL + raios */}
            <g style={{ opacity: Number(rayOpacity) }}>
                <circle cx={50} cy={45} r={18} fill="#fde047" />
                <g className="rayPulse">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const ang = (i * 30 * Math.PI) / 180
                        const x1 = round(50 + Math.cos(ang) * 22)
                        const y1 = round(45 + Math.sin(ang) * 22)
                        const x2 = round(50 + Math.cos(ang) * 32)
                        const y2 = round(45 + Math.sin(ang) * 32)
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth={2} />
                    })}
                </g>
            </g>

            {/* NUVEM + chuva */}
            <g transform="translate(120,36)" style={{ opacity: rainN }}>
                <Cloud />
                {Array.from({ length: 10 }).map((_, i) => (
                    <Raindrop key={i} x={-25 + i * 5} delay={i * 0.2} speed={1.8 + ((i % 3) * 0.3)} />
                ))}
            </g>

            {/* filetes de vento */}
            <g style={{ opacity: gustOpacity }}>
                <WindGust y={140} />
                <WindGust y={150} delay={0.6} />
                <WindGust y={160} delay={1.2} />
            </g>

            {/* caule e folhas */}
            <rect x={96} y={105} width={8} height={70} fill="url(#stem)" rx={4} />
            <path d="M96 140 C60 130, 60 160, 96 155" fill="#22c55e" />
            <path d="M104 155 C140 150, 140 120, 104 140" fill="#16a34a" />

            {/* inclinação por chuva/sol */}
            <g transform={`rotate(${droop.toFixed(2)} 100 105)`}>
                {/* balanço por vento */}
                <g className="sway" style={vars}>
                    {/* pétalas + miolo, com saturação/brilho do sol */}
                    <g style={{ filter: `saturate(${sunSat}) brightness(${sunBright})` }}>
                        {Array.from({ length: 8 }).map((_, i) => {
                            const ang = (i * 45 * Math.PI) / 180
                            const x = round(100 + Math.cos(ang) * 40)
                            const y = round(100 + Math.sin(ang) * 40)
                            return <circle key={i} cx={x} cy={y} r={26} fill="url(#petal)" />
                        })}
                        <circle cx={100} cy={100} r={22} fill="url(#center)" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

// --- subcomponentes ---

function Cloud() {
    return (
        <g>
            <circle cx={0} cy={8} r={11} fill="#cbd5e1" />
            <circle cx={10} cy={6} r={14} fill="#cbd5e1" />
            <circle cx={22} cy={10} r={11} fill="#cbd5e1" />
            <rect x={-8} y={10} width={40} height={10} rx={6} fill="#cbd5e1" />
        </g>
    )
}

function Raindrop({ x, delay = 0, speed = 2 }: { x: number; delay?: number; speed?: number }) {
    return (
        <g className="drop" style={{ animationDuration: `${speed}s`, animationDelay: `${delay}s` }}>
            <path d={`M ${x} 12 q 2 6 0 10 q -2 -4 0 -10 Z`} fill="#60a5fa" />
        </g>
    )
}

function WindGust({ y, delay = 0 }: { y: number; delay?: number }) {
    return (
        <g className="gust" style={{ animationDelay: `${delay}s` }}>
            <path
                d={`M -20 ${y} q 20 -6 40 0 q 16 6 32 0`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeLinecap="round"
            />
        </g>
    )
}
