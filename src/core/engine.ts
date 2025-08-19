import type { GameState, Player, RolesRegistry } from '../types';
import { ROLES } from '../roles/index';
import { canPlayerActAtNight } from '../utils/roleUtils';

export function createEmptyState(): GameState {
	return {
		phase: 'setup',
		nightNumber: 0,
		dayNumber: 0,
		players: [],
        setup: { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: { wolf: true, villager: true, guardia: true, medium: true, lover: false, crazyman: false, justicer: false, hangman: false, witch: false, dog: false, demoniac: false, insinuo: false } },
		revealIndex: 0,
		night: { turns: [], currentIndex: 0, context: null, summary: null },
		settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
        sindacoId: null as any,
		winner: null,
        lynchedHistory: [],
        usedPowers: {},
        eventHistory: { nights: [], days: [] },
        custom: {},
        history: {},
        nightDeathsByNight: {},
        lynchedHistoryByDay: {},
	};
}

/**
 * Initialize a player's role state based on their role definition
 */
export function initializePlayerRoleState(player: any, roleDef: any): void {
    if (!player || !roleDef) return;
    
    player.roleState = {
        // Runtime properties that can change during the game
        visibleAsTeam: roleDef.visibleAsTeam || roleDef.team,
        actsAtNight: roleDef.actsAtNight || 'never',
        
        // Static properties copied from role definition (never change)
        realTeam: roleDef.team,
        countAs: roleDef.countAs || roleDef.team,
        phaseOrder: roleDef.phaseOrder || 'any',
        usage: roleDef.usage || 'unlimited',
        canTargetDead: roleDef.canTargetDead || false,
        affectedRoles: roleDef.affectedRoles || [],
        immuneToKillers: roleDef.immuneToKillers || [],
        knownTo: roleDef.knownTo || [],
        revealPartnersRoleIds: roleDef.revealPartnersRoleIds || [],
        revealAlliesWithinRole: roleDef.revealAlliesWithinRole || false,
        revealToAllies: roleDef.revealToAllies || 'team',
        revealToPartners: roleDef.revealToPartners || 'role'
    };
}

// Setup helpers
export function initSetupPlayers(state: GameState): void {
	state.setup.players = Array.from({ length: state.setup.numPlayers }, (_, i) => ({ name: `Giocatore ${i + 1}` }));
	initDefaultRolesCounts(state);
}

export function initDefaultRolesCounts(state: GameState): void {
	const n = state.setup.numPlayers;
	const wolves = Math.max(getMinCountForRole(state, 'wolf'), Math.floor(n / 4));
	const guardia = n >= 5 ? Math.max(getMinCountForRole(state, 'guardia'), 1) : 0;
	const medium = n >= 6 ? Math.max(getMinCountForRole(state, 'medium'), 1) : 0;
	const insinuo = n >= 7 ? Math.max(getMinCountForRole(state, 'insinuo'), 1) : 0;
	const used = wolves + guardia + medium + insinuo;
	const villager = Math.max(0, n - used);
    state.setup.rolesCounts = { wolf: wolves, guardia, medium, insinuo, villager } as Record<string, number>;
    if (!state.setup.rolesEnabled) {
        state.setup.rolesEnabled = { wolf: true, villager: true, guardia: true, medium: true, lover: false, crazyman: false, justicer: false, hangman: false, witch: false, dog: false, demoniac: false, insinuo: false } as Record<string, boolean>;
    }
}

export function resizePlayers(state: GameState, nextCount: number): void {
	const n = Math.max(4, Math.min(20, Number(nextCount) || 0));
	state.setup.numPlayers = n;
	const current = state.setup.players.length;
	if (n > current) {
		for (let i = current; i < n; i += 1) state.setup.players.push({ name: `Giocatore ${i + 1}` });
	} else if (n < current) {
		state.setup.players.splice(n);
	}
}

export function normalizeRoleCounts(state: GameState): void {
    const roles = state.setup.rolesCounts;
    const enabled = state.setup.rolesEnabled || {};
    
    for (const key of Object.keys(roles)) {
        if (enabled && enabled[key] === false) {
            roles[key] = 0;
        } else {
            const min = getMinCountForRole(state, key);
            const max = getMaxCountForRole(state, key);
            const current = Math.floor(Number(roles[key]) || 0);
            
            if (current < min) {
                roles[key] = min;
            } else if (current > max) {
                roles[key] = max;
            } else {
                roles[key] = Math.max(0, current);
            }
        }
    }
}

export function updateRoleCount(state: GameState, roleId: string, count: number): void {
    const counts = state.setup.rolesCounts;
    const min = getMinCountForRole(state, roleId);
    const max = getMaxCountForRole(state, roleId);
    const next = Math.floor(Number(count) || 0);
    
    if (next === 0 && min > 0) {
        // Cannot set to 0 if role has minimum count requirement
        counts[roleId] = min;
    } else if (next === 0) {
        counts[roleId] = 0;
    } else if (next < min) {
        counts[roleId] = min;
    } else if (next > max) {
        counts[roleId] = max;
    } else {
        counts[roleId] = next;
    }
}

export function getMaxCount(state: GameState, roleId: string): number {
	const n = state.setup.numPlayers;
	const roleDef = (ROLES as any)?.[roleId] as any;
	const maxFromDef = roleDef?.maxCount;
	if (typeof maxFromDef === 'function') {
		return maxFromDef(state);
	}
	if (typeof maxFromDef === 'number') {
		return maxFromDef;
	}
	return n;
}

export function getMinCountForRole(state: GameState, roleId: string): number {
	const n = state.setup.numPlayers;
	const roleDef = (ROLES as any)?.[roleId] as any;
	const minFromDef = roleDef?.minCount;
	if (typeof minFromDef === 'function') {
		return minFromDef(state);
	}
	if (typeof minFromDef === 'number') {
		return minFromDef;
	}
	return 0;
}

export function getMaxCountForRole(state: GameState, roleId: string): number {
	return getMaxCount(state, roleId);
}

export function setRoleEnabled(state: GameState, roleId: string, enabled: boolean): void {
    if (!state.setup.rolesEnabled) state.setup.rolesEnabled = {} as any;
    // wolves and villagers cannot be disabled
    if (roleId === 'wolf' || roleId === 'villager') {
        state.setup.rolesEnabled[roleId] = true;
        normalizeRoleCounts(state);
        return;
    }
    state.setup.rolesEnabled[roleId] = !!enabled;
    
    if (!enabled) {
        state.setup.rolesCounts[roleId] = 0;
    } else {
        // When enabling a role, ensure it meets the minimum requirement
        const min = getMinCountForRole(state, roleId);
        if (min > 0) {
            state.setup.rolesCounts[roleId] = min;
        }
    }
    
    normalizeRoleCounts(state);
}

// Selectors
export function getAlivePlayers(state: GameState): Player[] {
	return state.players.filter(p => p.alive);
}
export function getAliveTeams(state: GameState): string[] {
	const alive = getAlivePlayers(state);
	const aliveTeams = new Set<string>(alive.map(p => p.roleState?.realTeam).filter(Boolean) as string[]);
	return Array.from(aliveTeams);
}
export function computeWinner(state: GameState): GameState['winner'] {
    const alive = getAlivePlayers(state);
    if (alive.length === 0) return null;
    
    const teams = new Set<string>();
    for (const p of alive) {
        const def = ROLES[p.roleId];
        if (!def) continue;
        const team = p.roleState?.realTeam || def.team;
        teams.add(team);
    }
    
    if (teams.size === 1) {
        return Array.from(teams)[0];
    }
    
    return null;
}

/**
 * Evaluate custom win conditions by iterating alive players and invoking their role's checkWin.
 * Returns the winning team id, or null.
 */
export function evaluateWinner(state: GameState, roles: RolesRegistry): string | null {
    const alivePlayers = getAlivePlayers(state);
    if (alivePlayers.length === 0) return null;
    
    // First, check if any role's checkWinConstraint blocks all wins
    for (const p of alivePlayers) {
        const def = roles[p.roleId];
        if (def && typeof def.checkWinConstraint === 'function') {
            try {
                if (def.checkWinConstraint(state as any)) {
                    return null; // This role blocks all wins
                }
            } catch {}
        }
    }
    
    // Let roles declare their faction win (dumb engine)
    for (const p of alivePlayers) {
        const def = roles[p.roleId];
        if (def && typeof def.checkWin === 'function') {
            try {
                if (def.checkWin(state as any)) {
                    const team = p.roleState?.realTeam || def.team;
                    return team || null;
                }
            } catch {}
        }
    }
    return null;
}

export function validateAndFixRoleCounts(state: GameState): void {
	const totalRoles = Object.values(state.setup.rolesCounts).reduce((sum, count) => sum + (count || 0), 0);
	const numPlayers = state.setup.numPlayers;
	
	console.log('Validating role counts:', {
		totalRoles,
		numPlayers,
		rolesCounts: state.setup.rolesCounts,
		rolesEnabled: state.setup.rolesEnabled
	});
	
	if (totalRoles !== numPlayers) {
		console.warn(`Role count mismatch: ${totalRoles} roles for ${numPlayers} players`);
		
		// Calculate how many villager roles we need
		const currentVillagers = state.setup.rolesCounts['villager'] || 0;
		const neededVillagers = numPlayers - totalRoles + currentVillagers;
		
		if (neededVillagers > 0) {
			console.log(`Adjusting villager count from ${currentVillagers} to ${neededVillagers}`);
			state.setup.rolesCounts['villager'] = neededVillagers;
		} else if (neededVillagers < 0) {
			console.warn(`Too many roles (${totalRoles}) for ${numPlayers} players. This shouldn't happen.`);
		}
	}
}

export function beginReveal(state: GameState, roleList: any[], shuffled: (a: string[]) => string[]): void {
	// Validate and fix role counts before proceeding
	validateAndFixRoleCounts(state);
	
	const pool: string[] = [];
	
	console.log('beginReveal called with:', {
		roleList: roleList.map(r => ({ id: r.id, name: r.name })),
		rolesCounts: state.setup.rolesCounts,
		rolesEnabled: state.setup.rolesEnabled,
		numPlayers: state.setup.numPlayers
	});
	
	// Only use roles that are enabled and have counts > 0
	for (const role of roleList) {
		const count = state.setup.rolesCounts[role.id] || 0;
		const isEnabled = state.setup.rolesEnabled?.[role.id] !== false;
		if (count > 0 && isEnabled) {
			for (let i = 0; i < count; i += 1) pool.push(role.id);
		}
	}
	
	console.log('Role pool created:', pool);
	
	// Validate that we have enough roles for all players
	if (pool.length !== state.setup.numPlayers) {
		console.error(`Critical error: Role pool size (${pool.length}) doesn't match player count (${state.setup.numPlayers})`);
		console.error('Role counts:', state.setup.rolesCounts);
		console.error('Roles enabled:', state.setup.rolesEnabled);
		
		// Try to fix by filling with villager roles
		const missingRoles = state.setup.numPlayers - pool.length;
		if (missingRoles > 0) {
			console.warn(`Attempting to fix by adding ${missingRoles} villager roles`);
			for (let i = 0; i < missingRoles; i++) {
				pool.push('villager');
			}
		}
	}
	
	const randomized = shuffled(pool);
	console.log('Randomized role assignments:', randomized);
	
	state.players = state.setup.players.map((p, idx) => {
		const roleId = randomized[idx];
		if (!roleId) {
			console.error(`No role available for player ${p.name} at index ${idx}`);
			console.error('Pool size:', pool.length, 'Player count:', state.setup.numPlayers);
		}
		
		return { 
			id: idx + 1, 
			name: p.name?.trim() || `Giocatore ${idx + 1}`, 
			roleId: roleId || 'villager', // Fallback to villager if no role available
			alive: true,
			roleState: {} as any
		};
	});
	
	// Initialize role states for each player
	for (const player of state.players) {
		const roleDef = ROLES[player.roleId];
		if (roleDef) {
			initializePlayerRoleState(player, roleDef);
		} else {
			console.error(`Unknown roleId: ${player.roleId} for player ${player.name}`);
			console.error('Available roles:', Object.keys(ROLES));
		}
	}
	
	state.revealIndex = 0;
	state.phase = 'revealRoles';
}

export function nextReveal(state: GameState, onEnd: () => void): void {
	if (state.revealIndex < state.players.length - 1) state.revealIndex += 1; else onEnd();
}

export function beginNight(state: GameState, roles: RolesRegistry): void {
	state.nightNumber += 1;
    // Reset per-night context and ensure usedPowers map exists
    if (!(state as any).usedPowers) (state as any).usedPowers = {};
    

    
		const sortedByRole = state.players
		.filter(p => {
			// Check if player has a prompt component
			const hasPrompt = typeof roles[p.roleId]?.getPromptComponent === 'function' || typeof roles[p.roleId]?.getGroupPromptComponent === 'function';
			
			if (!hasPrompt) return false;
			
			// Check if player should be skipped (can't act at all)
			const actsAtNight = p.roleState?.actsAtNight;
			
			// Skip players who can never act
			if (actsAtNight === 'never') return false;
			
			// ALL other players should be called at night, regardless of alive/dead/blocked status
			// The UI will show appropriate messages based on their state
			return true;
		})
				.sort((a, b) => {
			// Get phase order from player roleState (runtime state)
			const aOrder = a.roleState?.phaseOrder;
			const bOrder = b.roleState?.phaseOrder;
			
			// Handle "any" phase order - roles with "any" can act in any order
			if (aOrder === "any" && bOrder === "any") {
				return a.id - b.id;
			}
			
			// If one is "any", put it after numbered roles
			if (aOrder === "any") return 1;
			if (bOrder === "any") return -1;
			
			// Both are numbers, sort from lowest to highest (including negative numbers)
			const aNum = Number(aOrder);
			const bNum = Number(bOrder);
			
			// If both are valid numbers, sort numerically
			if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
				return aNum - bNum;
			}
			
			// If only one is a valid number, put the valid one first
			if (Number.isFinite(aNum)) return -1;
			if (Number.isFinite(bNum)) return 1;
			
			// If neither is a valid number, maintain stable order
			return a.id - b.id;
		});
    
    console.log('Filtered and sorted players:', sortedByRole.map(p => ({
        id: p.id,
        name: p.name,
        roleId: p.roleId,
        phaseOrder: p.roleState?.phaseOrder
    })));
	const visitedGroup = new Set<string>();
	const turns: any[] = [];
	const aliveIds = new Set(getAlivePlayers(state).map(p => p.id));
	for (const p of sortedByRole) {
		const roleDef = roles[p.roleId];
		if (roleDef?.group) {
			if (!visitedGroup.has(p.roleId)) {
				const groupPlayersAlive = state.players.filter(x => x.roleId === p.roleId && aliveIds.has(x.id));
				
				// For group roles, we always create a turn even if all are blocked
				// The UI will show a blocked message
				const playerIds = groupPlayersAlive.map(x => x.id);
				turns.push({ kind: 'group', roleId: p.roleId, playerIds: playerIds });
				

				visitedGroup.add(p.roleId);
			}
			continue;
		}
		
		// For once-per-game roles, skip if they've already acted in a previous night based on history
		if (rolesUsageOf(state, p.roleId) === 'once' && hasNonUndefinedHistoryBefore(state, p.id)) {
			continue;
		}
		
		// Always create turns for single roles, even if blocked
		// The UI will show a blocked message
		turns.push({ kind: 'single', roleId: p.roleId, playerId: p.id });
	}
    
    const nightContext = { 
		pendingKills: {}, 
		savesBy: [], 
		checks: []
	};
    

    
    state.night = { 
		turns, 
		currentIndex: 0, 
		context: nightContext, 
		summary: null 
	} as any;
    
    // Call passive effects for all players with night actions, regardless of blocking status
    // This ensures effects like wolf protection always work
    for (const p of sortedByRole) {
        const roleDef = roles[p.roleId];
        if (roleDef?.passiveEffect && typeof roleDef.passiveEffect === 'function') {
            try {
                roleDef.passiveEffect(state as any, p);
            } catch (error) {
                console.error(`Error in passive effect for ${p.roleId}:`, error);
            }
        }
    }
    
	state.phase = 'night';
}

export function recordNightResult(state: GameState, result: any): void {
	const entry = state.night.turns[state.night.currentIndex];
	if (!entry) return;

	// Handle single roles
	if (entry.kind === 'single') {
		const roleDef = ROLES[entry.roleId];
		const playerId = (entry as any).playerId;
		
		// Check if player can act at night using utility function
		const player = state.players.find(p => p.id === playerId);
		const canAct = player ? canPlayerActAtNight(player) : false;
		
		if (canAct) {
			// Player can act, proceed with normal role execution
			const registryUsage = rolesUsageOf(state, entry.roleId);
			if (registryUsage === 'once' && (result?.used === true)) {
				if (!(state as any).usedPowers) (state as any).usedPowers = {};
				const list = (state as any).usedPowers[entry.roleId] || [];
				if (!list.includes(playerId)) list.push(playerId);
				(state as any).usedPowers[entry.roleId] = list;
			}
			
			// Create the action object for the role to resolve
			const action = {
				roleId: entry.roleId,
				kind: entry.kind,
				playerId: playerId,
				playerIds: (entry as any).playerIds,
				data: result
			};
			
			// Call the role's resolve function immediately
			if (roleDef && typeof roleDef.resolve === 'function') {
				roleDef.resolve(state as any, action);
			}
			
			// Record a skip marker in history when the player explicitly did not act
			if (result && result.used === false) {
				if (!state.history) (state as any).history = {} as any;
				if (!(state as any).history[state.nightNumber]) (state as any).history[state.nightNumber] = {};
				(state as any).history[state.nightNumber][playerId] = undefined as any;
			}
		} else {
			// Player cannot act, but we still need to record this in history
			// This allows the UI to show appropriate messages (dead, blocked, wrong state)
			if (!state.history) (state as any).history = {} as any;
			if (!(state as any).history[state.nightNumber]) (state as any).history[state.nightNumber] = {};
			
			// Determine why the player cannot act
			let reason = 'unknown';
			if (player) {
				const actsAtNight = player.roleState?.actsAtNight;
				if (actsAtNight === 'blocked') reason = 'blocked';
				else if (actsAtNight === 'alive' && !player.alive) reason = 'dead';
				else if (actsAtNight === 'dead' && player.alive) reason = 'alive';
			}
			
			(state as any).history[state.nightNumber][playerId] = {
				type: 'role_skipped',
				nightNumber: state.nightNumber,
				playerId: playerId,
				reason: reason,
				roleId: entry.roleId
			};
		}
	}
	
	// Handle group roles
	if (entry.kind === 'group') {
		const roleDef = ROLES[entry.roleId];
		const playerIds = (entry as any).playerIds || [];
		
		// Check if ALL alive members of the group are blocked
		const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
		const allBlocked = aliveMembers.length > 0 && aliveMembers.every(player => 
			player.roleState?.actsAtNight === 'blocked'
		);
		
		if (allBlocked) {
			// All alive members are blocked - record this in history
			// This allows the UI to show appropriate blocked message
			if (!state.history) (state as any).history = {} as any;
			if (!(state as any).history[state.nightNumber]) (state as any).history[state.nightNumber] = {};
			
			// Record blocked group action
			(state as any).history[state.nightNumber][playerIds[0]] = {
				type: 'group_role_blocked',
				nightNumber: state.nightNumber,
				playerId: playerIds[0],
				playerIds: playerIds,
				roleId: entry.roleId,
				reason: 'blocked'
			};
		} else {
			// At least one member can act - proceed with normal group role execution
			const action = {
				roleId: entry.roleId,
				kind: entry.kind,
				playerId: playerIds[0], // Use first player as representative
				playerIds: playerIds,
				data: result
			};
			
			// Call the group role's resolve function immediately
			if (roleDef && typeof roleDef.resolve === 'function') {
				roleDef.resolve(state as any, action);
			}
		}
	}
	
	if (state.night.currentIndex < state.night.turns.length - 1) {
		state.night.currentIndex += 1;
	} else {
		state.phase = 'resolve';
	}
}

function rolesUsageOf(state: GameState, roleId: string): 'unlimited' | 'once' | 'requiredEveryNight' | undefined {
    const meta: any = ROLES[roleId];
    return meta?.usage;
}

export function resolveNight(state: GameState, roles: RolesRegistry): void {
    if (!state.night) return;
    
    // Roles are now resolved immediately in recordNightResult, so we only need to create the night summary
    
    // Create night summary from context
    if (state.night.context) {
        const context = state.night.context;
        const summary: any = {
            died: [],
            saved: [],
            targeted: [],
            checks: context.checks || []
        };

        // Process pending kills (roles have already handled saves/immunities)
        if (context.pendingKills) {
            for (const [playerId, kills] of Object.entries(context.pendingKills)) {
                const pid = Number(playerId);
                const player = state.players.find(p => p.id === pid);
                if (player && player.alive && (kills as any[]).length > 0) {
                    // If there are any remaining kills, the player dies
                    summary.died.push(pid);
                    player.alive = false;
                }
            }
        }

        // Build saved list from savesBy (for display purposes)
        if (context.savesBy) {
            for (const save of context.savesBy) {
                if (!summary.saved.includes(save.target)) {
                    summary.saved.push(save.target);
                }
            }
        }

        // Process targeted players (for roles that don't kill but target)
        if (context.targeted) {
            summary.targeted = [...context.targeted];
        }

        state.night.summary = summary;
        if (!(state as any).nightDeathsByNight) (state as any).nightDeathsByNight = {} as Record<number, number[]>;
        (state as any).nightDeathsByNight[state.nightNumber] = [...summary.died];
    }
    
    // Restore functions should NOT be called here - they should be called during day phase
    // The night effects should persist until the day phase
}

export function continueToDay(state: GameState, roles: RolesRegistry): void {
    const winner = computeWinner(state);
	if (winner) {
		state.winner = winner;
		state.phase = 'end';
		return;
	}
	
	// Call restore functions for all roles that have them, in reverse order of night phase execution
	if (state.night && state.night.turns && state.night.turns.length > 0) {
		const rolesWithRestore = state.night.turns
			.map(turn => ({ turn, role: roles[turn.roleId] }))
			.filter(({ role }) => role && typeof role.restoreFunction === 'function')
			.reverse(); // Reverse order so higher phase numbers (later night actions) restore first
		
		for (const { role } of rolesWithRestore) {
			role.restoreFunction!(state);
		}
	}
	
	state.dayNumber += 1;
	state.phase = 'day';
}

export function startNextNight(state: GameState, roles: RolesRegistry): void {
    // Before starting the night, check if the game is over according to custom win conditions
    const winner = evaluateWinner(state, roles);
	if (winner) {
		state.winner = winner;
		state.phase = 'end';
		return;
	}
	beginNight(state, roles);
}

export function createTestState(): GameState {
	const state = createEmptyState();
	state.players = [
		{ id: 1, name: 'Giocatore 1', roleId: 'insinuo', alive: true, roleState: {} as any },
		{ id: 2, name: 'Giocatore 2', roleId: 'wolf', alive: true, roleState: {} as any },
		{ id: 3, name: 'Giocatore 3', roleId: 'villager', alive: true, roleState: {} as any },
		{ id: 4, name: 'Giocatore 4', roleId: 'villager', alive: true, roleState: {} as any },
		{ id: 5, name: 'Giocatore 5', roleId: 'guardia', alive: true, roleState: {} as any },
		{ id: 6, name: 'Giocatore 6', roleId: 'guardia', alive: true, roleState: {} as any },
		{ id: 7, name: 'Giocatore 7', roleId: 'medium', alive: true, roleState: {} as any },
	];
	
	// Initialize role states for each player
	for (const player of state.players) {
		const roleDef = ROLES[player.roleId];
		if (roleDef) {
			initializePlayerRoleState(player, roleDef);
		}
	}
	
	state.setup.numPlayers = state.players.length;
	state.setup.players = state.players.map(p => ({ name: p.name }));
	state.setup.rolesCounts = { insinuo: 1, wolf: 1, villager: 2, guardia: 2, medium: 1 };
	
	// Ensure custom and history are initialized
	state.custom = {};
	state.history = {};
	
	// Set night number for history testing
	state.nightNumber = 1;
	
	return state;
}

export function setupGame(state: GameState, rolesCounts: Record<string, number>): void {
    const roles = Object.keys(rolesCounts);
    const players: Player[] = [];
    
    for (const [roleId, count] of Object.entries(rolesCounts)) {
        for (let i = 0; i < count; i++) {
            const player: Player = {
                id: players.length + 1,
                name: `Giocatore ${players.length + 1}`,
                roleId,
                alive: true,
                roleState: {} as any
            };
            
            // Initialize the player's role state
            const roleDef = ROLES[roleId];
            if (roleDef) {
                initializePlayerRoleState(player, roleDef);
            }
            
            players.push(player);
        }
    }
    
    state.players = players;
    state.setup.rolesCounts = rolesCounts;
    state.setup.numPlayers = players.length;
    state.setup.players = players.map(p => ({ name: p.name }));
}


// Day phase helpers
export function lynchPlayer(state: GameState, playerId: number): void {
    const target = state.players.find(p => p.id === playerId);
    if (!target || !target.alive) return;
    target.alive = false;
    if (!Array.isArray((state as any).lynchedHistory)) (state as any).lynchedHistory = [];
    (state as any).lynchedHistory.push(target.id);
    if (!(state as any).lynchedHistoryByDay) (state as any).lynchedHistoryByDay = {} as Record<number, number[]>;
    const day = state.dayNumber;
    if (!Array.isArray((state as any).lynchedHistoryByDay[day])) (state as any).lynchedHistoryByDay[day] = [];
    (state as any).lynchedHistoryByDay[day].push(target.id);
    
    // Store day event in history
    if (!state.history) state.history = {} as any;
    if (!state.eventHistory) state.eventHistory = { nights: [], days: [] } as any;
    if (state.eventHistory) {
        state.eventHistory.days.push({
            day: state.dayNumber,
            lynched: playerId
        });
    }
    
    // Immediate win for Crazyman if lynched
    const roleTeam = target.roleState?.realTeam;
    if (roleTeam === 'matti') {
        state.winner = 'matti';
        state.phase = 'end';
    }
}

export function completeDay(state: GameState, roles: RolesRegistry): void {
    if (state.phase === 'end' || state.winner) return;
    // Before transitioning, check custom win conditions
    const winner = evaluateWinner(state, roles);
    if (winner) {
        state.winner = winner;
        state.phase = 'end';
        return;
    }
    // Move to pre-night confirmation screen
    state.phase = 'preNight';
}

export function setSindaco(state: GameState, playerId: number): void {
    const target = state.players.find(p => p.id === playerId && p.alive);
    if (!target) return;
    (state as any).sindacoId = target.id;
}

export function getPlayerRealTimeVisibleTeam(gameState: any, playerId: number): string | undefined {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (!player || !gameState.players.find((p: any) => p.id === playerId)) return undefined;

    // Since roles are now resolved immediately, just return the current visible team
    // The Insinuo effect is already applied to the player's roleState
    return player.roleState?.visibleAsTeam || player.roleState?.realTeam;
}

function hasNonUndefinedHistoryBefore(state: any, playerId: number): boolean {
    const hist = state.history?.[playerId];
    if (!hist) return false;
    for (const nightKey of Object.keys(hist)) {
        const nightNum = Number(nightKey);
        if (!Number.isFinite(nightNum)) continue;
        if (nightNum >= state.nightNumber) continue;
        const arr = hist[nightNum];
        if (Array.isArray(arr) && arr.some(Boolean)) return true;
    }
    return false;
}


