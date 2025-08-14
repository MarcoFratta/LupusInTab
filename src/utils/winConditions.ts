import type { GameState } from '../stores/game';

export type WinCheck = (state: GameState) => boolean;

function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean }) => boolean): number {
    return state.players.reduce((acc, p) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

function isWolf(state: GameState, roleId: string): boolean {
    const meta = state.roleMeta[roleId] as any;
    if (!meta) return false;
    if (meta.countsAsWolfForWin) return true;
    return meta.team === 'wolf';
}

export function useWinConditions() {
    const wolvesWin: WinCheck = (state) => {
        const wolvesAlive = countAlive(state, (p) => isWolf(state, p.roleId));
        const nonWolvesAlive = countAlive(state, (p) => !isWolf(state, p.roleId));
        // Wolves win if wolves are in equal number with non-wolves (parity) or greater
        return wolvesAlive > 0 && wolvesAlive >= nonWolvesAlive;
    };

    const villageWin: WinCheck = (state) => {
        // Village-aligned roles win when no wolves remain
        const wolvesAlive = countAlive(state, (p) => isWolf(state, p.roleId));
        return wolvesAlive === 0;
    };

    const loversWin: WinCheck = (state) => {
        // For now, lovers share village win condition
        return villageWin(state);
    };

    return {
        wolvesWin,
        villageWin,
        loversWin,
    };
}


