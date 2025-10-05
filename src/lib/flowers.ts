// src/lib/flowers.ts
import { promises as fs } from 'fs';
import path from 'path';

export type Flower = {
    id: string; common: string; sci: string; emoji?: string;
    biome?: string; season?: string; summary?: string;
    colors?: Record<string, string | number>;
};

let cache: Flower[] | null = null;

export async function readFlowers(): Promise<Flower[]> {
    if (cache) return cache;
    const file = path.join(process.cwd(), 'public', 'flowers.json');
    cache = JSON.parse(await fs.readFile(file, 'utf-8'));
    return cache!;
}
export async function getFlowerById(id: string) {
    const list = await readFlowers();
    return list.find(f => f.id === id) || null;
}
