import type { GameState } from '../stores/game';

export type WinCheck = (state: GameState) => boolean;

function countAlive(state: GameState, predicate: (p: { roleId: string; alive: boolean }) => boolean): number {
    return state.players.reduce((acc, p) => acc + ((p.alive && predicate(p)) ? 1 : 0), 0);
}

function isLupoForWin(state: GameState, roleId: string): boolean {
	// Check if Lupomannaro is alive - if so, it blocks lupo wins unless exactly 2 players remain
	const lupomannaroAlive = countAlive(state, (p) => p.roleId === 'lupomannaro');
	const totalAlive = countAlive(state, (p) => p.alive);
	
	// If Lupomannaro is alive and more than 2 players remain, it blocks lupo wins
	if (lupomannaroAlive > 0 && totalAlive > 2) {
		return false;
	}
	
	// Hardcoded check for lupi team
	return roleId === 'lupo';
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

export function mannariWin(state: GameState): boolean {
	const mannariAlive = countAlive(state, (p) => {
		// Hardcoded check for mannari team
		return p.roleId === 'lupomannaro' || p.roleId === 'muccamannara';
	});
	
	if (mannariAlive === 0) return false;
	
	const nonMannariAlive = countAlive(state, (p) => {
		// Hardcoded check for non-mannari team
		return p.roleId !== 'lupomannaro' && p.roleId !== 'muccamannara';
	});
	
	// Mannari win when their count >= other players count
	return mannariAlive >= nonMannariAlive;
}

export function alieniWin(state: GameState): boolean {
	const alieniAlive = countAlive(state, (p) => {
		// Hardcoded check for alieni team
		return p.roleId === 'mutaforma';
	});
	
	if (alieniAlive === 0) return false;
	
	const teamCounts = new Map<string, number>();
	
	for (const player of state.players) {
		if (!player.alive) continue;
		
		// Hardcoded team assignment
		let team = 'villaggio';
		if (player.roleId === 'lupo') team = 'lupi';
		else if (player.roleId === 'lupomannaro' || player.roleId === 'muccamannara') team = 'mannari';
		else if (player.roleId === 'mutaforma') team = 'alieni';
		else if (player.roleId === 'matto') team = 'matti';
		
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
	const mannariAlive = countAlive(state, (p) => {
		return p.roleId === 'lupomannaro' || p.roleId === 'muccamannara';
	});
	
	// If any mannari is alive, block other teams from winning
	return mannariAlive > 0;
}


