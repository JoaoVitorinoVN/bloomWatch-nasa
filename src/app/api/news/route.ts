// src/app/api/news/route.ts
import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

/** Feeds focados em plantas/botânica.
 *  Fontes:
 *  - ScienceDaily (Plants & Animals): https://www.sciencedaily.com/rss/plants_animals.xml
 *  - Phys.org (Plants & Animals):    https://phys.org/rss-feed/biology-news/plants-animals/
 *  - Nature Plants (current):         https://www.nature.com/nplants.rss
 *  - The Guardian (Science/Plants):   https://www.theguardian.com/science/plants/rss
 */
const FEEDS = [
    'https://www.sciencedaily.com/rss/plants_animals.xml',   //
    'https://phys.org/rss-feed/biology-news/plants-animals/', //
    'https://www.nature.com/nplants.rss',                    // :contentReference[oaicite:2]{index=2}
    'https://www.theguardian.com/science/plants/rss',        //
]

type Item = {
    title: string
    link: string
    date: string
    source: string
}

/** util: tenta várias tags comuns de data */
function pickDate(node: any): string | null {
    return node.pubDate || node.published || node.updated || node['dc:date'] || null
}

export async function GET() {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })

    const now = Date.now()
    const maxAgeDays = 21 // últimas 3 semanas
    const minTime = now - maxAgeDays * 24 * 60 * 60 * 1000

    const results: Item[] = []

    await Promise.allSettled(
        FEEDS.map(async (url) => {
            const res = await fetch(url, { cache: 'no-store', next: { revalidate: 0 } })
            if (!res.ok) throw new Error(`feed ${url} -> ${res.status}`)
            const xml = await res.text()
            const data = parser.parse(xml)

            // RSS 2.0 (channel.item) ou Atom (feed.entry)
            const channel = data.rss?.channel
            const isRSS = !!channel
            const feedTitle = (isRSS ? channel?.title : data.feed?.title) ?? new URL(url).hostname

            const items = isRSS ? channel?.item ?? [] : data.feed?.entry ?? []

            for (const it of items) {
                const title = (it.title?.['#text'] ?? it.title) as string
                const link =
                    (Array.isArray(it.link) ? it.link[0]?.href : it.link?.href) ||
                    it.link ||
                    it.guid ||
                    url
                const dateStr = pickDate(it)
                const t = dateStr ? Date.parse(dateStr) : NaN
                if (!title || !link || Number.isNaN(t) || t < minTime) continue

                results.push({
                    title: String(title),
                    link: String(link),
                    date: new Date(t).toISOString(),
                    source: String(feedTitle),
                })
            }
        })
    )

    // ordena por recência e limita
    results.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    return NextResponse.json({ items: results.slice(0, 12) })
}
