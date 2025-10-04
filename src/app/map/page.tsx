'use client'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

type RegionProps = { id?: string; nome?: string; NM_REGIAO?: string; CD_REGIAO?: string }
type Feature = GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon, RegionProps>

const REGIONS = ['Norte','Nordeste','Centro-Oeste','Sudeste','Sul'] as const

function seasonBR(date = new Date()) {
    const m = date.getMonth()+1
    if (m===12 || m<=2) return 'Verão'
    if (m<=5) return 'Outono'
    if (m<=8) return 'Inverno'
    return 'Primavera'
}

export default function MapPage() {
    const mapRef = useRef<L.Map|null>(null)
    const geoRef = useRef<L.GeoJSON<any>|null>(null)
    const byNameRef = useRef<Record<string, L.Path>>({})
    const [regioes, setRegioes] = useState<Feature[]>([])
    const [ativa, setAtiva] = useState<Feature|null>(null)
    const [erroGeo, setErroGeo] = useState<string>()
    const [q, setQ] = useState('')

    const painel = useMemo(()=>({
        estacao: seasonBR(),
        titulo: ativa?.properties?.nome || ativa?.properties?.NM_REGIAO || 'Selecione uma região'
    }), [ativa])

    useEffect(() => {
        const map = L.map('map', { zoomControl: true, minZoom: 3 }).setView([-14.2, -51.9], 4)
        mapRef.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map)

        // Carrega GeoJSON de regiões (IBGE BC250) em /public/geo/regioes.geojson
        fetch('/geo/regioes.geojson').then(r=>r.json()).then((gj)=>{
            const feats: Feature[] = gj.features.map((f: any) => ({
                ...f, properties: {
                    ...f.properties,
                    id: f.properties?.CD_REGIAO ?? f.properties?.id,
                    nome: f.properties?.NM_REGIAO ?? f.properties?.nome
                }
            }))
            setRegioes(feats)

            const defaultStyle: L.PathOptions = { color:'#111827', weight:1, fillColor:'#22c55e', fillOpacity:0.25 }

            const layer = L.geoJSON(gj as any, {
                style: defaultStyle,
                onEachFeature: (feature, layer) => {
                    const nome = (feature as any).properties?.NM_REGIAO || (feature as any).properties?.nome
                    if (nome) byNameRef.current[nome] = layer as L.Path

                    layer.on('mouseover', ()=> (layer as L.Path).setStyle({ fillOpacity:0.5 }))
                    layer.on('mouseout',  ()=> geoRef.current?.resetStyle(layer as any)) // volta ao estilo base
                    layer.on('click', () => {
                        const f = feats.find(ff => ff.properties?.nome === nome) || (feature as any)
                        selectRegionByName(nome)
                        setAtiva(f as Feature)
                    })
                }
            }).addTo(map)

            geoRef.current = layer
            map.fitBounds(layer.getBounds(), { padding:[20,20] })
        })

        return () => { map.remove() }
    }, [])

    function highlight(layer?: L.Path) {
        if (!geoRef.current) return
        // limpa destaque anterior
        geoRef.current.eachLayer(l => geoRef.current!.resetStyle(l as any))
        if (layer) layer.setStyle({ color:'#0ea5e9', weight:2, fillColor:'#0ea5e9', fillOpacity:0.45 })
    }

    function selectRegionByName(nome: string) {
        const layer = byNameRef.current[nome]
        if (!layer || !mapRef.current) return
        highlight(layer)
        const b = (layer as any).getBounds?.()
        if (b) mapRef.current.fitBounds(b, { padding:[20,20] })
        const f = regioes.find(ff => (ff.properties?.nome===nome))
        if (f) setAtiva(f)
    }

    function localizar() {
        setErroGeo(undefined)
        if (!navigator.geolocation) { setErroGeo('Geolocalização não suportada.'); return }
        navigator.geolocation.getCurrentPosition(
            (pos)=>{
                const { latitude, longitude } = pos.coords
                const map = mapRef.current!
                map.flyTo([latitude, longitude], 8)
                const pt: GeoJSON.Feature<GeoJSON.Point> = {
                    type:'Feature', geometry:{ type:'Point', coordinates:[longitude, latitude] }, properties:{}
                }
                const hit = regioes.find((f)=> booleanPointInPolygon(pt, f as any))
                if (hit) {
                    setAtiva(hit)
                    const nome = hit.properties?.nome!
                    selectRegionByName(nome)
                }
            },
            (err)=> setErroGeo(err.message),
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        const nome = REGIONS.find(r => r.toLowerCase() === q.trim().toLowerCase())
        if (nome) selectRegionByName(nome)
    }

    return (
        <div className="relative min-h-dvh">
            {/* HEADER “GLASS” – flutuante, estilo Apple (blur + saturate) */}
            <header
                className="fixed left-1/2 -translate-x-1/2 top-4 z-[5000]
                   w-[min(960px,92vw)] rounded-2xl border border-white/30
                   bg-white/40 dark:bg-white/10
                   shadow-lg backdrop-blur-xl"
                style={{ WebkitBackdropFilter:'saturate(180%) blur(14px)', backdropFilter:'saturate(180%) blur(14px)' }}
                aria-label="Barra de ações"
            >
                <div className="flex flex-wrap gap-3 items-center px-4 py-3">
                    <div className="font-semibold tracking-tight text-slate-900/90 dark:text-white/90">
                        🌸 Flores do Brasil
                    </div>

                    {/* Busca por região (datalist simples; para A11Y avançada use ARIA combobox) */}
                    <form onSubmit={onSubmit} className="flex-1 min-w-[220px]">
                        <input
                            type="search"
                            list="regioes"
                            placeholder="Buscar região (Norte, Nordeste, ...)"
                            className="w-full rounded-xl px-3 py-2 bg-white/70 dark:bg-white/20 text-slate-900 placeholder:text-slate-500
                         border border-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            value={q} onChange={e=>setQ(e.target.value)}
                            aria-autocomplete="list" aria-haspopup="listbox" aria-controls="regioes"
                        />
                        <datalist id="regioes">
                            {REGIONS.map(r => <option key={r} value={r} />)}
                        </datalist>
                    </form>

                    <button
                        onClick={localizar}
                        className="px-3 py-2 rounded-xl bg-black/80 text-white hover:bg-black"
                        title="Centralizar no meu local"
                    >
                        Usar minha localização
                    </button>

                    <div className="ml-auto text-sm text-slate-700/80 dark:text-white/80">
                        Estação (HS): <b>{painel.estacao}</b>
                    </div>
                </div>
                {erroGeo && <div className="px-4 pb-3 text-sm text-red-600">{erroGeo}</div>}
            </header>

            {/* MAPA */}
            <div id="map" className="h-[100dvh] w-full bg-slate-200" />
        </div>
    )
}
