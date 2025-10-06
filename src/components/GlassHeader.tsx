'use client'

import Link from 'next/link';
import { JSX, useEffect, useId, useRef, useState } from 'react'

export type TabKey = 'estacao' | 'clima' | 'polinizacao' | 'ciclo'

// ⬇️ Renomeada para onChangeAction
type Props = { active: TabKey; onChangeAction: (k: TabKey) => void }

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
    { key: 'estacao',     label: 'Routine',       icon: <span aria-hidden>☀️</span> },
    { key: 'clima',       label: 'Climate',        icon: <span aria-hidden>🌧️</span> },
    { key: 'polinizacao', label: 'Polenization',  icon: <span aria-hidden>🐝</span> },
    { key: 'ciclo',       label: 'Cicle',        icon: <span aria-hidden>🌱</span> },
]

export default function GlassHeader({ active, onChangeAction }: Props) {
    const id = useId()
    const listRef = useRef<HTMLDivElement>(null)
    const [season, setSeason] = useState<string>('—')

    useEffect(() => { setSeason(getSeasonHS()) }, [])

    useEffect(() => {
        const el = listRef.current; if (!el) return
        function onKey(e: KeyboardEvent) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
            e.preventDefault()
            const order = TABS.map(t => t.key)
            const i = order.indexOf(active)
            onChangeAction(order[e.key === 'ArrowRight'
                ? (i + 1) % order.length
                : (i - 1 + order.length) % order.length])
        }
        el.addEventListener('keydown', onKey)
        return () => el.removeEventListener('keydown', onKey)
    }, [active, onChangeAction])

    const baseText = 'text-[#402613]'

    return (
        <header
            className="fixed left-1/2 -translate-x-1/2 top-4 z-[5000] w-[min(1100px,94vw)]
                 rounded-2xl glass glass-hairline glass-noise px-4 py-2"
        >
            <div className={`flex items-center gap-4 ${baseText}`}>
                <div className="font-semibold"><Link href={'/'}>🐝 Bee Eyes</Link></div>

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
                                onClick={() => onChangeAction(key)}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition
                  ${selected
                                    ? 'bg-white/80 border-white/70 shadow-sm'
                                    : 'bg-white/40 border-white/40 hover:bg-white/60'}
                  ${baseText}`}
                            >
                                {icon}<span className="hidden sm:inline">{label}</span>
                            </button>
                        )
                    })}
                </div>

                <div className={`ml-auto text-sm ${baseText}`}>
                    Season: <b>{season}</b>
                </div>
            </div>
        </header>
    )
}

function getSeasonHS(d = new Date()) {
    const m = d.getMonth() + 1
    if (m === 12 || m <= 2) return 'Summer'
    if (m <= 5) return 'Autumn'
    if (m <= 8) return 'Winter'
    return 'Spring'
}
