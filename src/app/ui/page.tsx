'use client'

import { useEffect, useMemo, useState } from 'react'
import GlassHeader, { TabKey } from '@/components/GlassHeader'
import FlowerHero, { FlowerTheme } from '@/components/FlowerHero'
import BloomBadge from '@/components/BloomBadge' // contador/prev de floração

type FlowerRec = {
    id: string
    common: string
    sci: string
    emoji: string
    biome: string
    season: string
    summary: string
    colors?: FlowerTheme & { petalCount?: number }
}

/* fallback para o primeiro load offline (caso falhe o fetch do JSON) */
const FALLBACK: FlowerRec[] = [
    {
        id: 'ipe-amarelo',
        common: 'Ipê-amarelo',
        sci: 'Handroanthus chrysotrichus',
        emoji: '💛',
        biome: '',
        season: '',
        summary: '',
        colors: {
            petalStart: '#fde047',
            petalEnd: '#f59e0b',
            centerStart: '#fef08a',
            centerEnd: '#f59e0b',
            stemStart: '#16a34a',
            stemEnd: '#065f46',
            leaf1: '#22c55e',
            leaf2: '#16a34a',
            petalCount: 6,
        },
    },
]

export default function UIPage() {
    const [tab, setTab] = useState<TabKey>('estacao')
    const [sun, setSun] = useState(70)
    const [rain, setRain] = useState(20)
    const [wind, setWind] = useState(15)

    const [flowers, setFlowers] = useState<FlowerRec[]>(FALLBACK)
    const [selectedId, setSelectedId] = useState<string>(FALLBACK[0].id)
    const [open, setOpen] = useState<FlowerRec | null>(null)

    // carrega /flowers.json (em public/)
    useEffect(() => {
        let alive = true
        fetch('/flowers.json', { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
            .then((arr: FlowerRec[]) => {
                if (alive && Array.isArray(arr) && arr.length) {
                    setFlowers(arr)
                    setSelectedId(arr[0].id)
                }
            })
            .catch(() => { /* mantém fallback */ })
        return () => { alive = false }
    }, [])

    const selected = useMemo(
        () => flowers.find((f) => f.id === selectedId) ?? flowers[0],
        [flowers, selectedId],
    )
    const theme = selected?.colors as FlowerTheme | undefined
    const petalCount = selected?.colors?.petalCount ?? 8

    return (
        <div className="min-h-dvh relative bg-gradient-to-br from-emerald-50 via-sky-50 to-fuchsia-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
            <div className="bg-bokeh" aria-hidden />
            <GlassHeader active={tab} onChange={setTab} />

            <main className="relative z-10 pt-28 pb-16 px-4 max-w-6xl mx-auto">

                {/* === Estação === */}
                {tab === 'estacao' && (
                    <section className="grid gap-4">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            Estação &amp; Humor
                        </h1>
                        <p className="text-slate-700 dark:text-slate-300">
                            Bem-vindo(a)! Aqui você vê destaques por estação e recomendações de cuidado.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <GlassCard title="Destaque da estação" subtitle="Primavera">
                                🌼 Pico de floração para espécies ornamentais — regas moderadas.
                            </GlassCard>
                            <GlassCard title="Cuidados rápidos" subtitle="Hoje">
                                ☀️ Sol: <b>{desc(sun)}</b> · 💧 Água: <b>{desc(rain)}</b> · 🌬️ Vento: <b>{desc(wind)}</b>
                            </GlassCard>
                            <GlassCard title="Sugestão de espécie" subtitle="Fácil de cuidar">
                                🌺 <b>Hibiscus rosa-sinensis</b> — florece bem com sol filtrado.
                            </GlassCard>
                        </div>
                    </section>
                )}

                {/* === Clima === */}
                {tab === 'clima' && (
                    <section className="space-y-8">
                        {/* seletor */}
                        <div className="glass glass-hairline glass-noise rounded-2xl p-2 flex gap-2 overflow-x-auto">
                            {flowers.map((f) => {
                                const active = f.id === selectedId
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => setSelectedId(f.id)}
                                        title={`${f.common} (${f.sci})`}
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition ${
                                            active
                                                ? 'ring-2 ring-emerald-400 bg-white/60 dark:bg-white/20'
                                                : 'hover:bg-white/40 dark:hover:bg-white/10'
                                        }`}
                                        aria-pressed={active}
                                    >
                                        <span className="text-2xl">{f.emoji}</span>
                                    </button>
                                )
                            })}
                            <div className="ml-2 text-sm self-center text-slate-700 dark:text-slate-300">
                                {selected ? <>Flor atual: <b>{selected.common}</b></> : '—'}
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-[1fr_420px]">
                            {/* painel de controles */}
                            <div className="glass glass-hairline glass-noise rounded-3xl p-5">
                                <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                                    Clima &amp; Controles
                                </h2>
                                <p className="text-slate-700 dark:text-slate-300 mb-6">
                                    Ajuste condições e veja a flor reagir.
                                </p>
                                <div className="space-y-6">
                                    <Slider label="Luz solar" value={sun} onChange={setSun} icon="☀️" />
                                    <Slider label="Chuva/rega" value={rain} onChange={setRain} icon="💧" />
                                    <Slider label="Vento" value={wind} onChange={setWind} icon="🌬️" />
                                </div>
                            </div>

                            {/* aside da flor selecionada */}
                            <aside className="glass glass-hairline glass-noise rounded-3xl p-5 relative">
                                {/* WRAPPER ABSOLUTO: garante canto direito SEMPRE */}
                                <div className="absolute top-3 right-3 select-none pointer-events-none">
                                    {selected?.id && <BloomBadge flowerId={selected.id} />}
                                </div>

                                <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">
                                    {selected?.common ?? 'Flor'}
                                </h3>
                                <div className="text-xs italic text-slate-600 dark:text-slate-300 mb-2">
                                    {selected?.sci}
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">
                                    <li>Sol: <b>{desc(sun)}</b> — evite queimar pétalas ao passar de 80%.</li>
                                    <li>Água: <b>{desc(rain)}</b> — drenagem leve em &gt; 60%.</li>
                                    <li>Vento: <b>{desc(wind)}</b> — tutor leve se for &gt; 50%.</li>
                                </ul>
                                <div className="mt-6 flex items-center justify-center">
                                    <div className="glass glass-hairline glass-noise rounded-2xl p-3">
                                        <FlowerHero size={180} sun={sun} rain={rain} wind={wind} theme={theme} petals={petalCount} />
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {/* lista de flores */}
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Flores do Brasil</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {flowers.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => { setSelectedId(f.id); setOpen(f) }}
                                        className="relative text-left glass glass-hairline glass-noise rounded-2xl p-4 hover:scale-[1.01] transition"
                                    >
                                        {/* WRAPPER ABSOLUTO: canto direito garantido */}
                                        <div className="absolute top-2 right-2 select-none pointer-events-none">
                                            <BloomBadge flowerId={f.id} />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{f.emoji}</span>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white">{f.common}</div>
                                                <div className="text-xs italic text-slate-600 dark:text-slate-300">{f.sci}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                                            <b>Bioma:</b> {f.biome}<br/>
                                            <b>Fenologia:</b> {f.season}<br/>
                                            {f.summary}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Polinização / Ciclo – mantenha como já está */}
            </main>

            {/* Modal de detalhes */}
            {open && (
                <Modal onClose={() => setOpen(null)} title={open.common} subtitle={open.sci}>
                    <p className="text-slate-800 dark:text-slate-200">
                        <b>Bioma:</b> {open.biome}<br/>
                        <b>Fenologia:</b> {open.season}
                    </p>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">{open.summary}</p>

                    <div className="mt-4 flex justify-end">
                        <button
                            className="glass glass-hairline rounded-lg px-3 py-2 hover:bg-white/60 dark:hover:bg-white/20"
                            onClick={() => { setSelectedId(open.id); setOpen(null) }}
                        >
                            Selecionar esta flor
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

/* ------- auxiliares ------- */

function desc(v: number) {
    if (v < 25) return 'baixo'
    if (v < 60) return 'médio'
    return 'alto'
}

function GlassCard({ title, subtitle, children }:{
    title: string; subtitle?: string; children: React.ReactNode
}) {
    return (
        <div className="glass glass-hairline glass-noise rounded-2xl p-4">
            {subtitle && <div className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</div>}
            <div className="font-semibold text-slate-900 dark:text-white mb-2">{title}</div>
            <div className="text-slate-800 dark:text-slate-200">{children}</div>
        </div>
    )
}

function Slider({ label, value, onChange, icon }:{
    label: string; value: number; onChange: (v:number)=>void; icon: string
}) {
    return (
        <label className="block">
            <div className="mb-2 font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                {icon} {label}: <span className="text-slate-600 dark:text-slate-300">{value}%</span>
            </div>
            <div className="glass glass-hairline glass-noise rounded-xl p-3">
                <input
                    type="range" min={0} max={100} value={value}
                    onChange={(e)=>onChange(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}
                />
            </div>
        </label>
    )
}

function Modal({ title, subtitle, onClose, children }:{
    title: string; subtitle?: string; onClose: ()=>void; children: React.ReactNode
}) {
    return (
        <div
            className="fixed inset-0 z-[6000] grid place-items-center p-4"
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
            onClick={(e)=>{ if (e.target === e.currentTarget) onClose() }}
        >
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
            <div className="relative glass glass-hairline glass-noise rounded-3xl p-5 w-[min(620px,92vw)]">
                <div className="flex items-start gap-2">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white" id="modal-title">{title}</div>
                    <button onClick={onClose} className="ml-auto rounded-lg px-2 py-1 hover:bg-white/40 dark:hover:bg-white/10">✕</button>
                </div>
                {subtitle && <div className="text-sm italic text-slate-600 dark:text-slate-300 mb-3">{subtitle}</div>}
                <div>{children}</div>
            </div>
        </div>
    )
}
