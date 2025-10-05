'use client'

import { useEffect, useMemo, useState } from 'react'
import GlassHeader, { TabKey } from '@/components/GlassHeader'
import FlowerHero, { FlowerTheme } from '@/components/FlowerHero'
import BloomBadge from '@/components/BloomBadge'
import Footer from '@/components/Footer'

// Mantidos da sua versão com Polinização
import GrowthChart from '@/components/GrowthChart'
import { inferPollination } from '@/lib/pollination'

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

/* ======= Ciclo: tipos/LS helpers ======= */
type NoteRec = {
    id: string
    title: string
    body: string
    flowerId: string
    flowerName: string
    daysAtCreation: number | null
    createdAt: string
}
const LS_KEY = 'bw_notes_v1'
const loadNotes = (): NoteRec[] => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
const saveNotes = (list: NoteRec[]) => localStorage.setItem(LS_KEY, JSON.stringify(list))

/* fallback */
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

    // carrega /flowers.json (public)
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

    // ===== Polinização (mantido) =====
    const poly = inferPollination(selected?.biome)
    const [daysUntil, setDaysUntil] = useState<number | null>(null)
    useEffect(() => {
        let alive = true
        if (!selected?.id) return
        fetch(`/api/phenology?id=${encodeURIComponent(selected.id)}`)
            .then(r => r.json())
            .then(d => { if (alive) setDaysUntil(d?.nextBloom?.daysUntil ?? null) })
            .catch(() => { if (alive) setDaysUntil(null) })
        return () => { alive = false }
    }, [selected?.id])

    // ===== Ciclo (anotações) =====
    const [notes, setNotes] = useState<NoteRec[]>([])
    const [noteTitle, setNoteTitle] = useState('')
    const [noteBody, setNoteBody] = useState('')

    useEffect(() => { setNotes(loadNotes()) }, [])
    useEffect(() => { saveNotes(notes) }, [notes])

    const addNote = () => {
        if (!noteTitle.trim() && !noteBody.trim()) return
        const rec: NoteRec = {
            id: crypto.randomUUID(),
            title: noteTitle.trim() || '(sem título)',
            body: noteBody.trim(),
            flowerId: selected?.id ?? '',
            flowerName: selected?.common ?? '—',
            daysAtCreation: daysUntil,
            createdAt: new Date().toISOString(),
        }
        setNotes([rec, ...notes])
        setNoteTitle(''); setNoteBody('')
    }
    const delNote = (id: string) => setNotes(notes.filter(n => n.id !== id))

    // 👇 correções mínimas para o seu JSX atual
    const handleSubmit = addNote
    const removeNote = delNote

    return (
        <div className="min-h-dvh relative text-[#402613]">
            <div className="bg-bokeh" aria-hidden />
            <GlassHeader active={tab} onChange={setTab} />

            <main className="relative z-10 pt-28 pb-16 px-4 max-w-6xl mx-auto">

                {/* === Rotina (Estação) === */}
                {tab === 'estacao' && (
                    <section className="grid gap-4">
                        <h1 className="text-2xl font-semibold tracking-tight">Estação &amp; Humor</h1>
                        <p className="opacity-80">Bem-vindo(a)! Aqui você vê destaques por estação e recomendações de cuidado.</p>

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

                        {/* Notícias */}
                        <NewsWall />
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
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition ${active
                                            ? 'ring-2 ring-amber-400 bg-white/60'
                                            : 'hover:bg-white/40'
                                        }`}
                                        aria-pressed={active}
                                    >
                                        <span className="text-2xl">{f.emoji}</span>
                                    </button>
                                )
                            })}
                            <div className="ml-2 text-sm self-center opacity-80">
                                {selected ? <>Flor atual: <b>{selected.common}</b></> : '—'}
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-[1fr_420px]">
                            {/* controles */}
                            <div className="glass glass-hairline glass-noise rounded-3xl p-5">
                                <h2 className="text-xl font-semibold mb-2">Clima &amp; Controles</h2>
                                <p className="opacity-80 mb-6">Ajuste condições e veja a flor reagir.</p>
                                <div className="space-y-6">
                                    <Slider label="Luz solar" value={sun} onChange={setSun} icon="☀️" />
                                    <Slider label="Chuva/rega" value={rain} onChange={setRain} icon="💧" />
                                    <Slider label="Vento" value={wind} onChange={setWind} icon="🌬️" />
                                </div>
                            </div>

                            {/* aside */}
                            <aside className="glass glass-hairline glass-noise rounded-3xl p-5 relative">
                                <div className="absolute top-3 right-3 select-none pointer-events-none">
                                    {selected?.id && <BloomBadge flowerId={selected.id} />}
                                </div>

                                <h3 className="font-semibold mb-1">{selected?.common ?? 'Flor'}</h3>
                                <div className="text-xs italic opacity-70 mb-2">{selected?.sci}</div>
                                <ul className="list-disc pl-5 space-y-1">
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
                            <h2 className="text-lg font-semibold">Flores do Brasil</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {flowers.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => { setSelectedId(f.id); setOpen(f) }}
                                        className="relative text-left glass glass-hairline glass-noise rounded-2xl p-4 hover:scale-[1.01] transition"
                                    >
                                        <div className="absolute top-2 right-2 select-none pointer-events-none">
                                            <BloomBadge flowerId={f.id} />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{f.emoji}</span>
                                            <div>
                                                <div className="font-semibold">{f.common}</div>
                                                <div className="text-xs italic opacity-70">{f.sci}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <b>Bioma:</b> {f.biome}<br />
                                            <b>Fenologia:</b> {f.season}<br />
                                            {f.summary}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* === Polinização (mantido) === */}
                {tab === 'polinizacao' && selected && (
                    <section className="grid gap-6 md:grid-cols-[minmax(320px,1fr)_minmax(420px,1.2fr)]">
                        {/* esquerda: flor grande + badge */}
                        <div className="glass glass-hairline glass-noise rounded-3xl p-5 relative flex items-center justify-center">
                            <div className="absolute top-3 right-3 select-none pointer-events-none">
                                <BloomBadge flowerId={selected.id} />
                            </div>
                            <div className="text-center">
                                <FlowerHero size={260} sun={sun} rain={rain} wind={wind} theme={theme} petals={petalCount} />
                                <div className="mt-3 text-sm">
                                    <b>{selected.common}</b>
                                    <div className="text-xs italic opacity-80">{selected.sci}</div>
                                </div>
                            </div>
                        </div>

                        {/* direita: cartões */}
                        <div className="grid gap-4">
                            <div className="glass glass-hairline glass-noise rounded-2xl p-5">
                                <h3 className="font-semibold mb-2">Terreno adequado</h3>
                                <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <dt className="opacity-80">pH ideal</dt>
                                        <dd>
                                            <Meter
                                                value={(poly.soil.phMin + poly.soil.phMax) / 2}
                                                min={4}
                                                max={8}
                                                label={`${poly.soil.phMin.toFixed(1)}–${poly.soil.phMax.toFixed(1)}`}
                                            />
                                        </dd>
                                    </div>
                                    <div><dt className="opacity-80">Textura</dt><dd><Chip>{poly.soil.texture}</Chip></dd></div>
                                    <div><dt className="opacity-80">Drenagem</dt><dd><Chip>{poly.soil.drainage}</Chip></dd></div>
                                    <div><dt className="opacity-80">Luz</dt><dd><Chip>{poly.soil.light}</Chip></dd></div>
                                </dl>
                            </div>

                            <div className="glass glass-hairline glass-noise rounded-2xl p-5">
                                <h3 className="font-semibold mb-2">Polinizadores</h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {poly.likelyPollinators.map(p => (
                                        <Chip key={p}>
                                            {p === 'abelhas' && '🐝 '}
                                            {p === 'borboletas' && '🦋 '}
                                            {p === 'beija-flores' && '🐦‍⬛ '}
                                            {p === 'morcegos' && '🦇 '}
                                            {p === 'moscas' && '🪰 '}
                                            {p}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            <div className="glass glass-hairline glass-noise rounded-2xl p-5">
                                <h3 className="font-semibold mb-1">Tempo de crescimento</h3>
                                <p className="text-sm opacity-80 mb-3">
                                    Estimativa {poly.totalDaysToBloom} dias (semente → floração).
                                    {typeof daysUntil === 'number' && <> Próx. floração em <b>{daysUntil}d</b>.</>}
                                </p>
                                <div className="overflow-x-auto">
                                    <GrowthChart totalDays={poly.totalDaysToBloom} daysUntilBloom={daysUntil} />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* === CICLO — bloco de notas === */}
                {tab === 'ciclo' && (
                    <section className="grid gap-4">
                        {/* Formulário */}
                        <div className="glass glass-hairline glass-noise rounded-3xl p-5">
                            <h2 className="text-xl font-semibold mb-1">Anotações do ciclo</h2>
                            <p className="text-sm opacity-80 mb-4">
                                Registre eventos do cultivo. A nota é carimbada com a <b>flor atual</b> e o número de
                                <b> dias restantes</b> para a próxima floração.
                            </p>

                            <label className="block mb-3">
                                <div className="text-sm mb-1">Título</div>
                                <input
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    onKeyDown={(e) => (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && handleSubmit()}
                                    placeholder="Ex.: Rega reforçada / transplante / adubação"
                                    className="w-full rounded-xl px-3 py-2 glass glass-hairline"
                                />
                            </label>

                            <label className="block">
                                <div className="text-sm mb-1">Descrição</div>
                                <textarea
                                    value={noteBody}
                                    onChange={(e) => setNoteBody(e.target.value)}
                                    onKeyDown={(e) => (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) && handleSubmit()}
                                    rows={4}
                                    placeholder="Detalhes do que foi feito/observado… (Envie com Ctrl/⌘+Enter)"
                                    className="w-full rounded-xl px-3 py-2 glass glass-hairline"
                                />
                            </label>

                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={handleSubmit}
                                    className="px-3 py-2 rounded-lg glass glass-hairline hover:bg-white/60"
                                >
                                    Salvar nota
                                </button>
                                <div className="text-sm opacity-70">
                                    Flor atual: <b>{selected?.common}</b> • Próx. floração:{' '}
                                    <b>{daysUntil == null ? '—' : daysUntil === 0 ? '0d' : `${daysUntil}d`}</b>
                                </div>
                            </div>
                        </div>

                        {/* Cards das notas (abaixo do form) */}
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {notes.length === 0 ? (
                                <div className="glass glass-hairline glass-noise rounded-2xl p-4 text-sm opacity-80">
                                    Nenhuma anotação ainda. Escreva um título/descrição acima e salve para criar seu primeiro
                                    card.
                                </div>
                            ) : (
                                notes.map((n) => {
                                    // calcula selo e progresso para o anel azul
                                    const badgeText =
                                        n.daysAtCreation == null
                                            ? '—'
                                            : n.daysAtCreation === 0
                                                ? 'em floração'
                                                : `faltam ${n.daysAtCreation}d`

                                    const progress =
                                        n.daysAtCreation == null
                                            ? 0
                                            : Math.max(0, Math.min(100, ((90 - Math.min(90, n.daysAtCreation)) / 90) * 100)))

                                    return (
                                        <article key={n.id} className="relative glass glass-hairline glass-noise rounded-2xl p-4">
                                            {/* selo canto direito */}
                                            <div className="absolute top-2 right-2 select-none pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#402613]">
                          <svg width="18" height="18" viewBox="0 0 36 36" className="opacity-90">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(64,38,19,.25)" strokeWidth="3" />
                            <circle
                                cx="18"
                                cy="18"
                                r="14"
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                strokeDasharray={`${(progress / 100) * 88} 88`}
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                          </svg>
                            {badgeText}
                        </span>
                                            </div>

                                            <div className="text-xs opacity-70 mb-1">
                                                {new Date(n.createdAt).toLocaleString()} • {n.flowerName}
                                            </div>
                                            <h4 className="font-semibold mb-1 break-words">{n.title}</h4>
                                            {n.body && <p className="text-sm opacity-90 whitespace-pre-wrap break-words">{n.body}</p>}

                                            <div className="mt-3">
                                                <button
                                                    onClick={() => removeNote(n.id)}
                                                    className="px-2 py-1 rounded-lg glass glass-hairline hover:bg-white/60 text-sm"
                                                >
                                                    Apagar
                                                </button>
                                            </div>
                                        </article>
                                    )
                                })
                            )}
                        </div>
                    </section>
                )}
            </main>

            {/* Modal */}
            {open && (
                <Modal onClose={() => setOpen(null)} title={open.common} subtitle={open.sci}>
                    <p>
                        <b>Bioma:</b> {open.biome}<br />
                        <b>Fenologia:</b> {open.season}
                    </p>
                    <p className="mt-2 opacity-80">{open.summary}</p>

                    <div className="mt-4 flex justify-end">
                        <button
                            className="glass glass-hairline rounded-lg px-3 py-2 hover:bg-white/60"
                            onClick={() => { setSelectedId(open.id); setOpen(null) }}
                        >
                            Selecionar esta flor
                        </button>
                    </div>
                </Modal>
            )}

            <Footer/>
        </div>
    )
}

/* ========= Notícias ========= */
function NewsWall() {
    const [items, setItems] = useState<{ title: string; link: string; date: string; source: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let alive = true
        fetch('/api/news', { cache: 'no-store' })
            .then(r => r.json())
            .then((d) => { if (alive && Array.isArray(d.items)) setItems(d.items) })
            .finally(() => alive && setLoading(false))
        return () => { alive = false }
    }, [])

    return (
        <section className="mt-2">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notícias recentes sobre Biologia</h2>
                <a
                    className="text-[13px] underline decoration-amber-500/60 hover:opacity-80"
                    href="https://www.google.com/search?q=plants+botany+flowers&tbm=nws"
                    target="_blank" rel="noopener noreferrer"
                >
                    ver mais
                </a>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {(loading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass glass-hairline glass-noise rounded-2xl p-4 animate-pulse">
                        <div className="h-4 w-1/2 bg-black/10 rounded mb-2" />
                        <div className="h-3 w-2/3 bg-black/10 rounded" />
                    </div>
                )) : items.map((n, i) => (
                    <a
                        key={i}
                        href={n.link}
                        target="_blank" rel="noopener noreferrer"
                        className="glass glass-hairline glass-noise rounded-2xl p-4 hover:scale-[1.01] transition block"
                    >
                        <div className="text-xs opacity-70 mb-1">
                            <b>{new URL(n.link).hostname.replace('www.', '')}</b> • {timeAgo(n.date)}
                        </div>
                        <div className="font-medium leading-snug">{n.title}</div>
                    </a>
                )))}
            </div>
        </section>
    )
}

function timeAgo(iso: string) {
    const t = Date.parse(iso); const diff = Math.max(0, Date.now() - t)
    const d = Math.floor(diff / 864e5); if (d > 0) return `${d} dia${d > 1 ? 's' : ''} atrás`
    const h = Math.floor(diff / 36e5); if (h > 0) return `${h} h atrás`
    const m = Math.floor(diff / 6e4); return `${m || 0} min atrás`
}

/* ------- auxiliares ------- */
function desc(v: number) { if (v < 25) return 'baixo'; if (v < 60) return 'médio'; return 'alto' }

function GlassCard({ title, subtitle, children }: {
    title: string; subtitle?: string; children: React.ReactNode
}) {
    return (
        <div className="glass glass-hairline glass-noise rounded-2xl p-4">
            {subtitle && <div className="text-sm opacity-70">{subtitle}</div>}
            <div className="font-semibold mb-2">{title}</div>
            <div>{children}</div>
        </div>
    )
}

function Slider({ label, value, onChange, icon }: {
    label: string; value: number; onChange: (v: number) => void; icon: string
}) {
    return (
        <label className="block">
            <div className="mb-2 font-medium flex items-center gap-2">
                {icon} {label}: <span className="opacity-70">{value}%</span>
            </div>
            <div className="glass glass-hairline glass-noise rounded-xl p-3">
                <input
                    type="range" min={0} max={100} value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full accent-amber-500"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}
                />
            </div>
        </label>
    )
}

function Modal({ title, subtitle, onClose, children }: {
    title: string; subtitle?: string; onClose: () => void; children: React.ReactNode
}) {
    return (
        <div
            className="fixed inset-0 z-[6000] grid place-items-center p-4"
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative glass glass-hairline glass-noise rounded-3xl p-5 w-[min(620px,92vw)]">
                <div className="flex items-start gap-2">
                    <div className="text-lg font-semibold" id="modal-title">{title}</div>
                    <button onClick={onClose} className="ml-auto rounded-lg px-2 py-1 hover:bg-white/40">✕</button>
                </div>
                {subtitle && <div className="text-sm italic opacity-70 mb-3">{subtitle}</div>}
                <div>{children}</div>
            </div>
        </div>
    )
}

/* helpers visuais usados na aba Polinização */
function Meter({ value, min, max, label }: { value: number; min: number; max: number; label?: string }) {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
    return (
        <div>
            <div className="h-2 rounded-full bg-[rgba(64,38,19,.15)] relative overflow-hidden">
                <div className="absolute inset-y-0 left-0" style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg,#60a5fa,#22c55e)'
                }} />
            </div>
            <div className="mt-1 text-xs opacity-70">{label ?? value.toFixed(1)}</div>
        </div>
    )
}
function Chip({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                     bg-[rgba(255,255,255,.55)] border border-[rgba(255,255,255,.4)]
                     text-[#402613] text-xs">
      {children}
    </span>
    )
}
