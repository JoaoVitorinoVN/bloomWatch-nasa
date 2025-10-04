'use client'

import { useMemo, useState } from 'react'
import GlassHeader, { TabKey } from '@/components/GlassHeader'
import FlowerHero from '@/components/FlowerHero'

type Flower = {
    common: string
    sci: string
    emoji: string
    biome: string
    season: string
    summary: string
}

const FLOWERS: Flower[] = [
    {
        common: 'Pau-brasil',
        sci: 'Paubrasilia echinata',
        emoji: '🌳',
        biome: 'Mata Atlântica litorânea',
        season: 'floração dez–jul',
        summary:
            'Árvore simbólica do Brasil, polinizada principalmente por abelhas; ocorre na faixa costeira do RJ ao RN.',
    },
    {
        common: 'Ipê-amarelo',
        sci: 'Handroanthus chrysotrichus',
        emoji: '💛',
        biome: 'Mata Atlântica e Cerrado',
        season: 'inverno/primavera (geralmente ago–set)',
        summary:
            'Árvore ornamental de pequeno a médio porte, copa larga; flores intensamente amarelas em época de seca.',
    },
    {
        common: 'Vitória-régia',
        sci: 'Victoria amazonica',
        emoji: '🪷',
        biome: 'Amazônia, águas calmas',
        season: 'flores noturnas (mudam de branco → rosa na 2ª noite)',
        summary:
            'Gigante aquática: flores aquecem e atraem besouros; fecham de dia, reabrem à noite mudando de cor.',
    },
    {
        common: 'Manacá-da-serra',
        sci: 'Tibouchina mutabilis',
        emoji: '💜',
        biome: 'Mata Atlântica (Serra do Mar)',
        season: 'primavera/verão',
        summary:
            'Flores mudam de branco → lilás-claro → lilás-escuro; espécie típica da encosta atlântica sul-sudeste.',
    },
    {
        common: 'Cattleya labiata',
        sci: 'Cattleya labiata',
        emoji: '🌸',
        biome: 'NE/N/SE do Brasil (epífita)',
        season: 'final do verão ao início do outono',
        summary:
            '“Rainha do Nordeste”: orquídea epífita de clima sazonalmente seco; flores grandes e perfumadas.',
    },
    {
        common: 'Ipê-roxo',
        sci: 'Handroanthus impetiginosus',
        emoji: '💜🌳',
        biome: 'Amazônia, Caatinga, Cerrado, Mata Atlântica, Pantanal',
        season: 'maio–ago',
        summary:
            'Decíduo; flores roxas em panículas durante a seca. Muito usado em arborização e restauração.',
    },
]

export default function UIPage() {
    const [tab, setTab] = useState<TabKey>('estacao')
    const [sun, setSun] = useState(70)
    const [rain, setRain] = useState(20)
    const [wind, setWind] = useState(15)
    const [open, setOpen] = useState<Flower | null>(null)

    return (
        <div className="min-h-dvh relative bg-gradient-to-br from-emerald-50 via-sky-50 to-fuchsia-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
            <div className="bg-bokeh" aria-hidden />
            <GlassHeader active={tab} onChange={setTab} />

            <main className="relative z-10 pt-28 pb-16 px-4 max-w-6xl mx-auto">
                {/* === Painel 1 — Estação & Humor === */}
                {tab === 'estacao' && (
                    <section className="grid gap-6 lg:grid-cols-[auto_1fr]">
                        <div className="flex items-center justify-center">
                            <div className="glass glass-hairline glass-noise rounded-3xl p-4">
                                <FlowerHero size={260} sun={sun} rain={rain} wind={wind} />
                            </div>
                        </div>

                        <div className="grid gap-4 content-start">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Estação &amp; Humor</h1>
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

                            {/* === NOVO: Lista de flores do Brasil === */}
                            <div className="mt-4">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Flores do Brasil (exemplos)</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {FLOWERS.map((f) => (
                                        <button
                                            key={f.sci}
                                            onClick={() => setOpen(f)}
                                            className="text-left glass glass-hairline glass-noise rounded-2xl p-4 hover:scale-[1.01] transition"
                                        >
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
                        </div>
                    </section>
                )}

                {/* === Painel 2 — Clima & Controles === */}
                {tab === 'clima' && (
                    <section className="grid gap-8 md:grid-cols-[1fr_420px]">
                        <div className="glass glass-hairline glass-noise rounded-3xl p-5">
                            <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Clima &amp; Controles</h2>
                            <p className="text-slate-700 dark:text-slate-300 mb-6">Ajuste condições e veja a flor reagir.</p>
                            <div className="space-y-6">
                                <Slider label="Luz solar" value={sun} onChange={setSun} icon="☀️" />
                                <Slider label="Chuva/rega" value={rain} onChange={setRain} icon="💧" />
                                <Slider label="Vento" value={wind} onChange={setWind} icon="🌬️" />
                            </div>
                        </div>

                        <aside className="glass glass-hairline glass-noise rounded-3xl p-5">
                            <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Recomendações</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">
                                <li>Sol: <b>{desc(sun)}</b> — evite queimar pétalas ao passar de 80%.</li>
                                <li>Água: <b>{desc(rain)}</b> — drenagem leve em &gt; 60%.</li>
                                <li>Vento: <b>{desc(wind)}</b> — tutor leve se for &gt; 50%.</li>
                            </ul>
                            <div className="mt-6 flex items-center justify-center">
                                <div className="glass glass-hairline glass-noise rounded-2xl p-3">
                                    <FlowerHero size={180} sun={sun} rain={rain} wind={wind} />
                                </div>
                            </div>
                        </aside>
                    </section>
                )}

                {/* === Painel 3 — Polinização === */}
                {tab === 'polinizacao' && (
                    <section className="grid gap-6 lg:grid-cols-[auto_1fr]">
                        <div className="flex items-center justify-center">
                            <div className="glass glass-hairline glass-noise rounded-3xl p-4">
                                <FlowerHero size={220} sun={sun} rain={rain} wind={wind} />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Polinização</h2>
                            <p className="text-slate-700 dark:text-slate-300">Atraia polinizadores e acompanhe visitas.</p>

                            <div className="grid md:grid-cols-3 gap-3">
                                <PolCard emoji="🐝" titulo="Abelhas" texto="Preferem flores amarelas/azuis e manhãs sem vento." />
                                <PolCard emoji="🦋" titulo="Borboletas" texto="Atraídas por cores vivas e néctar acessível." />
                                <PolCard emoji="🦇" titulo="Morcegos" texto="Ativos à noite; flores claras e aromáticas." />
                            </div>

                            <div className="glass glass-hairline glass-noise rounded-2xl p-4">
                                <h3 className="font-medium mb-2 text-slate-900 dark:text-white">Lista de visitas (exemplo)</h3>
                                <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                                    <li>08:12 — <b>Apis mellifera</b> (abelha-europeia)</li>
                                    <li>10:47 — <b>Heliconius erato</b> (borboleta-da-paixão)</li>
                                    <li>19:30 — <b>Glossophaga soricina</b> (morcego-beija-flor)</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* === Painel 4 — Ciclo de Vida === */}
                {tab === 'ciclo' && (
                    <section className="grid gap-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Ciclo de Vida</h2>
                        <div className="grid sm:grid-cols-4 gap-3">
                            <Stage emoji="🌱" titulo="Germinação" texto="Semente acorda; umidade constante." />
                            <Stage emoji="🌿" titulo="Vegetativa" texto="Folhas e caule; adubar levemente." />
                            <Stage emoji="🌼" titulo="Botões" texto="Luz estável e menos vento." />
                            <Stage emoji="🌺" titulo="Floração" texto="Pico de cor; rega moderada." />
                        </div>
                        <div className="glass glass-hairline glass-noise rounded-2xl p-4">
                            <p className="text-slate-800 dark:text-slate-200">
                                Dica: anote datas das fases para comparar entre estações.
                            </p>
                        </div>
                    </section>
                )}
            </main>

            {/* === Modal glass com detalhes da flor === */}
            {open && (
                <Modal onClose={() => setOpen(null)} title={open.common} subtitle={open.sci}>
                    <p className="text-slate-800 dark:text-slate-200">
                        <b>Bioma:</b> {open.biome}<br/>
                        <b>Fenologia:</b> {open.season}
                    </p>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">{open.summary}</p>
                </Modal>
            )}
        </div>
    )
}

/* ---------- componentes locais ---------- */

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

function PolCard({ emoji, titulo, texto }:{ emoji:string; titulo:string; texto:string }) {
    return (
        <div className="glass glass-hairline glass-noise rounded-2xl p-4">
            <div className="text-2xl">{emoji}</div>
            <div className="font-semibold text-slate-900 dark:text-white">{titulo}</div>
            <p className="text-slate-800 dark:text-slate-200 text-sm">{texto}</p>
        </div>
    )
}

function Stage({ emoji, titulo, texto }:{ emoji:string; titulo:string; texto:string }) {
    return (
        <div className="glass glass-hairline glass-noise rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">{emoji}</div>
            <div className="font-semibold text-slate-900 dark:text-white">{titulo}</div>
            <p className="text-slate-800 dark:text-slate-200 text-sm">{texto}</p>
        </div>
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
