'use client'

import { JSX, useEffect, useId, useRef, useState } from 'react'

export type TabKey = 'estacao' | 'clima' | 'polinizacao' | 'ciclo'

type Props = { active: TabKey; onChange: (k: TabKey) => void }

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
    { key: 'estacao',      label: 'Estação',      icon: <span aria-hidden>☀️</span> },
    { key: 'clima',        label: 'Clima',        icon: <span aria-hidden>🌧️</span> },
    { key: 'polinizacao',  label: 'Polinização',  icon: <span aria-hidden>🐝</span> },
    { key: 'ciclo',        label: 'Ciclo',        icon: <span aria-hidden>🌱</span> },
]

export default function GlassHeader({ active, onChange }: Props) {
    const id = useId()
    const listRef = useRef<HTMLDivElement>(null)
    const [season, setSeason] = useState<string>('—') // evita mismatch no SSR

    useEffect(() => { setSeason(getSeasonHS()) }, [])

    // navegação por teclado (APG Tabs – manual activation)
    useEffect(() => {
        const el = listRef.current; if (!el) return
        function onKey(e: KeyboardEvent) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
            e.preventDefault()
            const order = TABS.map(t => t.key)
            const i = order.indexOf(active)
            onChange(order[e.key === 'ArrowRight' ? (i + 1) % order.length : (i - 1 + order.length) % order.length])
        }
        el.addEventListener('keydown', onKey)
        return () => el.removeEventListener('keydown', onKey)
    }, [active, onChange])

    return (
        <header
            className="fixed left-1/2 -translate-x-1/2 top-4 z-[5000] w-[min(1100px,94vw)]
                 rounded-2xl glass glass-hairline glass-noise px-4 py-2"
        >
            <div className="flex items-center gap-4">
                <div className="font-semibold text-slate-900/90 dark:text-white/90">🌸 Flores do Brasil</div>

                <div ref={listRef} role="tablist" aria-label="Seções" className="flex gap-2 ml-2">
                    {TABS.map(({ key, label, icon }) => {
                        const selected = key === active
                        return (
                            <button
                                key={key}
                                id={`${id}-tab-${key}`}
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`${id}-panel-${key}`}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => onChange(key)}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition
                  ${selected
                                    ? 'bg-white/80 dark:bg-white/20 text-slate-900 dark:text-white border-white/70 dark:border-white/20 shadow-sm'
                                    : 'bg-white/40 dark:bg-white/10 text-slate-900/80 dark:text-white/80 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/20'}`}
                            >
                                {icon}<span className="hidden sm:inline">{label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="ml-auto text-sm text-slate-700/80 dark:text-white/80">
                    Estação (HS): <b>{season}</b>
                </div>
            </div>
        </header>
    )
}

function getSeasonHS(d = new Date()) {
    const m = d.getMonth() + 1
    if (m === 12 || m <= 2) return 'Verão'
    if (m <= 5) return 'Outono'
    if (m <= 8) return 'Inverno'
    return 'Primavera'
}
