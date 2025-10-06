// src/lib/pollination.ts
export type SoilSpec = {
    phMin: number; phMax: number;
    texture: 'arenoso' | 'argiloso' | 'franco' | 'rochoso';
    drainage: 'baixa' | 'média' | 'alta';
    light: 'sombra' | 'meia-sombra' | 'sol-pleno';
};

export type PollinationInfo = {
    soil: SoilSpec;
    likelyPollinators: Array<'abelhas' | 'borboletas' | 'beija-flores' | 'morcegos' | 'moscas'>;
    totalDaysToBloom: number; // estimativa geral (semente->floração) para o gráfico
};

const byBiome: Record<string, PollinationInfo> = {
    // heurísticas simples e “críveis” para o app (podem ser refinadas depois)
    'Cerrado': {
        soil: { phMin: 5.0, phMax: 6.5, texture: 'arenoso', drainage: 'alta', light: 'sol-pleno' },
        likelyPollinators: ['abelhas', 'borboletas', 'beija-flores'],
        totalDaysToBloom: 90,
    },
    'Mata Atlântica': {
        soil: { phMin: 5.5, phMax: 6.8, texture: 'franco', drainage: 'média', light: 'meia-sombra' },
        likelyPollinators: ['abelhas', 'borboletas', 'beija-flores'],
        totalDaysToBloom: 110,
    },
    'Amazônia': {
        soil: { phMin: 5.0, phMax: 6.5, texture: 'argiloso', drainage: 'média', light: 'meia-sombra' },
        likelyPollinators: ['abelhas', 'morcegos', 'borboletas'],
        totalDaysToBloom: 120,
    },
    'Caatinga': {
        soil: { phMin: 6.0, phMax: 7.0, texture: 'rochoso', drainage: 'alta', light: 'sol-pleno' },
        likelyPollinators: ['abelhas', 'morcegos'],
        totalDaysToBloom: 80,
    },
    'Pantanal': {
        soil: { phMin: 5.5, phMax: 7.0, texture: 'franco', drainage: 'média', light: 'sol-pleno' },
        likelyPollinators: ['abelhas', 'borboletas'],
        totalDaysToBloom: 100,
    },
    'Restinga': {
        soil: { phMin: 6.0, phMax: 7.0, texture: 'arenoso', drainage: 'alta', light: 'sol-pleno' },
        likelyPollinators: ['abelhas', 'borboletas', 'beija-flores'],
        totalDaysToBloom: 95,
    },
};

// fallback genérico (maioria das plantas gostam de pH ~6–7 e boa drenagem)
export function inferPollination(biomeText: string | undefined): PollinationInfo {
    if (biomeText) {
        const key = Object.keys(byBiome).find(k => biomeText.toLowerCase().includes(k.toLowerCase()));
        if (key) return byBiome[key];
    }
    return {
        soil: { phMin: 6.0, phMax: 7.0, texture: 'franco', drainage: 'média', light: 'sol-pleno' },
        likelyPollinators: ['abelhas', 'borboletas', 'beija-flores'],
        totalDaysToBloom: 90,
    };
}
