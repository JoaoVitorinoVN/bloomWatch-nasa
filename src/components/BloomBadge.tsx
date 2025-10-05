'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
    flowerId: string;
    lat?: number;
    lng?: number;
    /** classes extras aplicadas ao <span> interno (não altera posição) */
    className?: string;
};

export default function BloomBadge({ flowerId, lat, lng, className = '' }: Props) {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState<number | null>(null);
    const [src, setSrc] = useState<'inat' | 'season' | 'none'>('none');

    useEffect(() => {
        const q = new URLSearchParams({ id: flowerId });
        if (lat != null && lng != null) {
            q.set('lat', String(lat));
            q.set('lng', String(lng));
        }
        fetch(`/api/phenology?${q.toString()}`)
            .then((r) => r.json())
            .then((d) => {
                setDays(d?.nextBloom?.daysUntil ?? null);
                setSrc(d?.source ?? 'none');
            })
            .catch(() => setDays(null))
            .finally(() => setLoading(false));
    }, [flowerId, lat, lng]);

    const pct = useMemo(() => {
        if (days == null) return 0;
        return Math.max(0, Math.min(100, Math.round((1 - Math.min(days, 90) / 90) * 100)));
    }, [days]);

    // tipografia branca; sem bg/border; NENHUM posicionamento aqui!
    const cls =
        'inline-flex items-center gap-1.5 text-[11px] font-medium text-white drop-shadow ' + className;

    if (loading) {
        return (
            <span className={cls} title="calculando…">
        <SpinnerDot /> …
      </span>
        );
    }
    if (days == null) {
        return <span className={cls}>sem previsão</span>;
    }

    return (
        <span
            className={cls}
            title={
                src === 'inat' ? 'Previsto por iNaturalist' : src === 'season' ? 'Estimado pela estação' : ''
            }
        >
      {/* anel de progresso (sem fundo) */}
            <svg width="18" height="18" viewBox="0 0 36 36" className="opacity-90">
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
        <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="url(#g)"
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 88} 88`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
            {days === 0 ? 'em floração' : `faltam ${days} dia${days === 1 ? '' : 's'}`}
    </span>
    );
}

function SpinnerDot() {
    return <span className="inline-block w-2 h-2 rounded-full bg-white/70 animate-pulse" aria-hidden />;
}
