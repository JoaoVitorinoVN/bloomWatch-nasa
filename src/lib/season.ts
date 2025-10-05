// src/lib/season.ts
const MAP: Record<string, number[]> = {
    'jan':[1],'fev':[2],'mar':[3],'abr':[4],'mai':[5],'jun':[6],
    'jul':[7],'ago':[8],'set':[9],'out':[10],'nov':[11],'dez':[12],
    'primavera':[9,10,11], 'verão':[12,1,2], 'inverno':[6,7,8], 'outono':[3,4,5]
};

export function monthsFromSeasonText(txt: string) {
    const s = (txt || '').toLowerCase(); const found = new Set<number>();
    Object.entries(MAP).forEach(([k, arr]) => { if (s.includes(k)) arr.forEach(m => found.add(m)); });
    const m = s.match(/(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s*[–-]\s*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/);
    if (m) {
        const keys = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        const a = keys.indexOf(m[1]); const b = keys.indexOf(m[2]);
        for (let i=0;i<12;i++){ const idx=(a+i)%12; found.add(idx+1); if (idx===b) break; }
    }
    return [...found].sort((x,y)=>x-y);
}

export function nextBloomFromSeasonText(txt: string, now = new Date()) {
    const months = monthsFromSeasonText(txt);
    if (!months.length) return null;
    const curM = now.getMonth() + 1;
    const nextM = months.find(m => m >= curM) ?? months[0];
    const year = nextM >= curM ? now.getFullYear() : now.getFullYear() + 1;
    const target = new Date(Date.UTC(year, nextM - 1, 1, 0, 0, 0));
    const days = Math.max(0, Math.ceil((target.getTime()-Date.now())/86400000));
    return { month: nextM, daysUntil: days };
}
