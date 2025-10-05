// src/lib/inat.ts
const INAT = 'https://api.inaturalist.org/v1';

export type HistoResponse = { results?: { month_of_year?: Record<string, number> } };

export async function getFloweringHistogram(opts: {
    sci: string; lat?: number; lng?: number; radiusKm?: number; fetchImpl?: typeof fetch;
}) {
    const { sci, lat, lng, radiusKm = 200, fetchImpl = fetch } = opts;

    const params = new URLSearchParams({
        taxon_name: sci,
        verifiable: 'true',
        interval: 'month_of_year',   // histograma por mês
        term_id: '12',               // Plant Phenology
        term_value_id: '13',         // Flowering
    });
    if (lat != null && lng != null) {
        params.set('lat', String(lat));
        params.set('lng', String(lng));
        params.set('radius', String(radiusKm)); // km
    }

    const url = `${INAT}/observations/histogram?${params.toString()}`;
    const res = await fetchImpl(url, { next: { revalidate: 3600 } }); // 1h de cache
    if (!res.ok) throw new Error(`iNat error ${res.status}`);
    const data = (await res.json()) as HistoResponse;
    return data.results?.month_of_year ?? {};
}

/** Converte histograma 1..12 -> {month,daysUntil} */
export function nextBloomFromHistogram(monthCounts: Record<string, number>, now = new Date()) {
    const counts = Array.from({ length: 12 }, (_, i) => ({ m: i + 1, c: monthCounts[String(i + 1)] ?? 0 }));
    if (counts.every(x => x.c === 0)) return null;
    const max = Math.max(...counts.map(x => x.c));
    const peaks = counts.filter(x => x.c === max).map(x => x.m);
    const curM = now.getMonth() + 1;
    const nextM = peaks.find(m => m >= curM) ?? peaks[0];
    const year = nextM >= curM ? now.getFullYear() : now.getFullYear() + 1;
    const target = new Date(Date.UTC(year, nextM - 1, 1, 0, 0, 0));
    const days = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000));
    return { month: nextM, daysUntil: days };
}
