import type { GameState } from '../stores/game';
import { ROLES } from '../roles';

export type WinCheck = (state: GameState) => boolean;

function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean }) => boolean): number {
    return state.players.reduce((acc, p) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

function isLupoForWin(state: GameState, roleId: string): boolean {
	const roleDef = ROLES[roleId];
	if (!roleDef) return false;
	
	// Check if Lupomannaro is alive - if so, it blocks lupo wins unless exactly 2 players remain
	const lupomannaroAlive = countAlive(state, (p) => p.roleId === 'lupomannaro');
	const totalAlive = countAlive(state, (p) => p.alive);
	
	// If Lupomannaro is alive and more than 2 players remain, it blocks lupo wins
	if (lupomannaroAlive > 0 && totalAlive > 2) {
		return false;
	}
	
	// Use countAs if defined, otherwise fall back to team
	const effectiveTeamForWin = roleDef.countAs || roleDef.team;
	return effectiveTeamForWin === 'lupi';
}

export function wolvesWin(state: GameState): boolean {
	const lupiAlive = countAlive(state, (p) => isLupoForWin(state, p.roleId));
	const nonLupiAlive = countAlive(state, (p) => !isLupoForWin(state, p.roleId));
	
	// Wolves win by parity: lupi >= non-lupi
	return lupiAlive >= nonLupiAlive;
}

export function villageWin(state: GameState): boolean {
	// Check if Lupomannaro is alive - if so, it blocks village wins unless exactly 2 players remain
	const lupomannaroAlive = countAlive(state, (p) => p.roleId === 'lupomannaro');
	const totalAlive = countAlive(state, (p) => p.alive);
	
	if (lupomannaroAlive > 0 && totalAlive > 2) {
		return false;
	}
	
	// Village wins when no lupi remain AND no lupomannaro remain
	const lupiAlive = countAlive(state, (p) => isLupoForWin(state, p.roleId));
	const lupomannaroAliveForWin = countAlive(state, (p) => p.roleId === 'lupomannaro');
	
	return lupiAlive === 0 && lupomannaroAliveForWin === 0;
}

export function useWinConditions() {
    const wolvesWin: WinCheck = (state) => {
        // Check if Lupomannaro is alive - if so, it blocks lupo wins unless exactly 2 players remain
        const lupomannaroAlive = countAlive(state, (p) => p.roleId === 'lupomannaro');
        const totalAlive = countAlive(state, (p) => true);
        
        // If Lupomannaro is alive and more than 2 players remain, lupi cannot win
        if (lupomannaroAlive > 0 && totalAlive > 2) {
            return false;
        }
        
        // For wolves parity calculation, count roles that count as lupi for win conditions
        const lupiAlive = countAlive(state, (p) => isLupoForWin(state, p.roleId));
        const nonLupiAlive = countAlive(state, (p) => !isLupoForWin(state, p.roleId));
        // Wolves win if wolves are in equal number with non-wolves (parity) or greater
        return lupiAlive > 0 && lupiAlive >= nonLupiAlive;
    };

    const villageWin: WinCheck = (state) => {
        // Check if Lupomannaro is alive - if so, it blocks village wins unless exactly 2 players remain
        const lupomannaroAlive = countAlive(state, (p) => p.roleId === 'lupomannaro');
        const totalAlive = countAlive(state, (p) => true);
        
        // If Lupomannaro is alive and more than 2 players remain, village cannot win
        if (lupomannaroAlive > 0 && totalAlive > 2) {
            return false;
        }
        
        // Village-aligned roles win when no roles that count as lupi for win conditions remain AND no lupomannaro remain
        const lupiAlive = countAlive(state, (p) => isLupoForWin(state, p.roleId));
        const lupomannaroAliveForWin = countAlive(state, (p) => p.roleId === 'lupomannaro');
        return lupiAlive === 0 && lupomannaroAliveForWin === 0;
    };

    const alieniWin: WinCheck = (state) => {
        const alieniAlive = countAlive(state, (p) => {
            const roleDef = ROLES[p.roleId];
            if (!roleDef) return false;
            const team = roleDef.team;
            return team === 'alieni';
        });
        
        if (alieniAlive === 0) return false;
        
        const teamCounts = new Map<string, number>();
        
        for (const player of state.players) {
            if (!player.alive) continue;
            
            const roleDef = ROLES[player.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            if (team === 'alieni') continue;
            
            teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
        }
        
        if (teamCounts.size === 0) return false;
        
        const teamCountsArray = Array.from(teamCounts.values());
        const firstCount = teamCountsArray[0];
        
        return teamCountsArray.every(count => count === firstCount) && firstCount === alieniAlive;
    };

    return {
        wolvesWin,
        villageWin,
        alieniWin
    };
}


