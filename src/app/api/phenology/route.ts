import { NextRequest, NextResponse } from 'next/server';
import { getFlowerById } from '@/lib/flowers';
import { getFloweringHistogram, nextBloomFromHistogram } from '@/lib/inat';
import { nextBloomFromSeasonText } from '@/lib/season';

export const revalidate = 3600; // 1h

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

    const lat = searchParams.get('lat'); const lng = searchParams.get('lng');
    const coords = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined;

    const flower = await getFlowerById(id);
    if (!flower) return NextResponse.json({ error: 'unknown id' }, { status: 404 });

    let source: 'inat' | 'season' | 'none' = 'none';
    let histo: Record<string, number> = {};
    let next: { month: number; daysUntil: number } | null = null;

    try {
        histo = await getFloweringHistogram({ sci: flower.sci, lat: coords?.lat, lng: coords?.lng, radiusKm: 200 });
        next = nextBloomFromHistogram(histo);
        if (next) source = 'inat';
    } catch { /* cai no fallback */ }

    if (!next) {
        const fb = nextBloomFromSeasonText(flower.season ?? '');
        if (fb) { next = fb; source = 'season'; }
    }

    return NextResponse.json({ id, sci: flower.sci, histogram: histo, nextBloom: next, source });
}
