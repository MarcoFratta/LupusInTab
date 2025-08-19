import type { GameState } from '../stores/game';

export type WinCheck = (state: GameState) => boolean;

function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean }) => boolean): number {
    return state.players.reduce((acc, p) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

function isWolfForWin(state: GameState, roleId: string): boolean {
    const player = state.players.find(p => p.roleId === roleId);
    if (!player || !player.roleState) return false;
    return (player.roleState.countAs || player.roleState.realTeam) === 'lupi';
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
        
        // For wolves parity calculation, count roles that count as lupi for win conditions
        const wolvesAlive = countAlive(state, (p) => isWolfForWin(state, p.roleId));
        const nonWolvesAlive = countAlive(state, (p) => !isWolfForWin(state, p.roleId));
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
        
        // Village-aligned roles win when no roles that count as lupi for win conditions remain
        const wolvesAlive = countAlive(state, (p) => isWolfForWin(state, p.roleId));
        return wolvesAlive === 0;
    };

    return {
        wolvesWin,
        villageWin
    };
}


