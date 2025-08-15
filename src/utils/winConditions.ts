import type { GameState } from '../stores/game';

export type WinCheck = (state: GameState) => boolean;

function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean }) => boolean): number {
    return state.players.reduce((acc, p) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

function isWolf(state: GameState, roleId: string): boolean {
    const meta = state.roleMeta[roleId] as any;
    if (!meta) return false;
    return meta.team === 'lupi';
}

function isWolfForParity(state: GameState, roleId: string): boolean {
    const meta = state.roleMeta[roleId] as any;
    if (!meta) return false;
    if (meta.countsAsWolfForWin) return true;
    return meta.team === 'lupi';
}

export function useWinConditions() {
    const wolvesWin: WinCheck = (state) => {
        // Check if LupoMannaro is alive - if so, it blocks wolf wins unless exactly 2 players remain
        const dogAlive = countAlive(state, (p) => p.roleId === 'dog');
        const totalAlive = countAlive(state, (p) => true);
        
        // If LupoMannaro is alive and more than 2 players remain, wolves cannot win
        if (dogAlive > 0 && totalAlive > 2) {
            return false;
        }
        
        // For wolves parity calculation, count roles that have countsAsWolfForWin (like dog)
        const wolvesAlive = countAlive(state, (p) => isWolfForParity(state, p.roleId));
        const nonWolvesAlive = countAlive(state, (p) => !isWolfForParity(state, p.roleId));
        // Wolves win if wolves are in equal number with non-wolves (parity) or greater
        return wolvesAlive > 0 && wolvesAlive >= nonWolvesAlive;
    };

    const villageWin: WinCheck = (state) => {
        // Check if LupoMannaro is alive - if so, it blocks village wins unless exactly 2 players remain
        const dogAlive = countAlive(state, (p) => p.roleId === 'dog');
        const totalAlive = countAlive(state, (p) => true);
        
        // If LupoMannaro is alive and more than 2 players remain, village cannot win
        if (dogAlive > 0 && totalAlive > 2) {
            return false;
        }
        
        // Village-aligned roles win when no ACTUAL wolves remain (exclude roles with countsAsWolfForWin like dog)
        const actualWolvesAlive = countAlive(state, (p) => isWolf(state, p.roleId));
        return actualWolvesAlive === 0;
    };

    const loversWin: WinCheck = (state) => {
        // Check if LupoMannaro is alive - if so, it blocks lover wins unless exactly 2 players remain
        const dogAlive = countAlive(state, (p) => p.roleId === 'dog');
        const totalAlive = countAlive(state, (p) => true);
        
        // If LupoMannaro is alive and more than 2 players remain, lovers cannot win
        if (dogAlive > 0 && totalAlive > 2) {
            return false;
        }
        
        // For now, lovers share village win condition
        return villageWin(state);
    };

    return {
        wolvesWin,
        villageWin,
        loversWin,
    };
}


