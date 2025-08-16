export interface FactionDef {
    id: string;
    name: string;
    color: string; // hex
}

export const FACTIONS: Record<string, FactionDef> = {
    lupi: { id: 'lupi', name: 'Lupi', color: '#ef4444' },
    village: { id: 'village', name: 'Villaggio', color: '#22c55e' },
    matti: { id: 'matti', name: 'Folle', color: '#a855f7' },
    mannari: { id: 'mannari', name: 'Mannari', color: '#6366f1' },
};

export function getFaction(id: string): FactionDef {
    return FACTIONS[id] || { id, name: id, color: '#9ca3af' };
}


