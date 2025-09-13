import type { GameState } from '../types';

export type WinCheck = (state: GameState) => boolean;

/**
 * Count alive players matching a predicate
 */
function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean; roleState: { countAs: string } }) => boolean): number {
    return state.players.reduce((acc: number, p: any) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

/**
 * Get all alive players that count as a specific team for win conditions
 */
function getAlivePlayersByCountAs(state: GameState, team: string): number {
    return countAlive(state, (p) => p.roleState?.countAs === team);
}

export function wolvesWin(state: GameState): boolean {
    const lupiAlive = getAlivePlayersByCountAs(state, 'lupi');
    const nonLupiAlive = countAlive(state, (p) => p.roleState?.countAs !== 'lupi');
    
    // Wolves win by parity: lupi >= non-lupi
    return lupiAlive >= nonLupiAlive;
}

export function villageWin(state: GameState): boolean {
    // Village wins when no lupi remain (using countAs property)
    const lupiAlive = getAlivePlayersByCountAs(state, 'lupi');
    
    return lupiAlive === 0;
}

export function mannariWin(state: GameState): boolean {
    const mannariAlive = getAlivePlayersByCountAs(state, 'mannari');
    
    if (mannariAlive === 0) return false;
    
    const nonMannariAlive = countAlive(state, (p) => p.roleState?.countAs !== 'mannari');
    
    // Mannari win when their count >= other players count
    return mannariAlive >= nonMannariAlive;
}

export function alieniWin(state: GameState): boolean {
    const alieniAlive = getAlivePlayersByCountAs(state, 'alieni');
    
    if (alieniAlive === 0) return false;
    
    const teamCounts = new Map<string, number>();
    
    for (const player of state.players) {
        if (!player.alive) continue;
        
        const team = player.roleState?.countAs || player.roleState.realTeam;
        
        if (team === 'alieni') continue;
        
        teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    }
    
    if (teamCounts.size === 0) return false;
    
    const teamCountsArray = Array.from(teamCounts.values());
    const firstCount = teamCountsArray[0];
    
    return teamCountsArray.every(count => count === firstCount) && firstCount === alieniAlive;
}

/**
 * Common constraint function for mannari roles (lupomannaro and muccamannara)
 * Blocks other teams from winning when any mannari role is alive
 */
export function mannariBlocksOtherWins(state: GameState): boolean {
    const mannariAlive = getAlivePlayersByCountAs(state, 'mannari');
    
    // If any mannari is alive, block other teams from winning
    return mannariAlive > 0;
}


