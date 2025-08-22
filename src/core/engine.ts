import type { GameState, Player, RolesRegistry } from '../types';
import { ROLES } from '../roles/index';
import { canPlayerActAtNight, hasPlayerExceededUsageLimit } from '../utils/roleUtils';

export function createEmptyState(): GameState {
	return {
		phase: 'setup',
		nightNumber: 0,
		dayNumber: 0,
		players: [],
        setup: { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: { lupo: true, villico: true, guardia: true, veggente: true, massone: false, matto: false, giustiziere: false, boia: false, medium: false, lupomannaro: false, indemoniato: false, insinuo: false, barabba: false, angelo: false } },
		revealIndex: 0,
		night: { turns: [], currentIndex: 0, context: null, summary: null },
		settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
        sindacoId: null as any,
		winner: null,
        lynchedHistory: [],
        usedPowers: {},

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
        phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any',
        usage: roleDef.usage || 'unlimited',
        effectType: roleDef.effectType || 'optional',
        numberOfUsage: roleDef.numberOfUsage || 'unlimited',
        startNight: roleDef.startNight || 1,
        canTargetDead: roleDef.canTargetDead || false,
        affectedRoles: roleDef.affectedRoles || [],

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
	const lupi = Math.max(getMinCountForRole(state, 'lupo'), Math.floor(n / 4));
	const guardia = n >= 5 ? Math.max(getMinCountForRole(state, 'guardia'), 1) : 0;
	const veggente = n >= 6 ? Math.max(getMinCountForRole(state, 'veggente'), 1) : 0;
	const insinuo = n >= 7 ? Math.max(getMinCountForRole(state, 'insinuo'), 1) : 0;
	const used = lupi + guardia + veggente + insinuo;
	const villico = Math.max(0, n - used);
    state.setup.rolesCounts = { lupo: lupi, guardia, veggente, insinuo, villico } as Record<string, number>;
    if (!state.setup.rolesEnabled) {
        state.setup.rolesEnabled = { lupo: true, villico: true, guardia: true, veggente: true, massone: false, matto: false, giustiziere: false, boia: false, medium: false, lupomannaro: false, indemoniato: false, insinuo: false, barabba: false, angelo: false, genio: false } as Record<string, boolean>;
    }
    
    // Normalize role counts to respect rolesEnabled setting
    normalizeRoleCounts(state);
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
	
	// Recalculate role counts after changing player count
	initDefaultRolesCounts(state);
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
    if (roleId === 'lupo' || roleId === 'villico') {
        state.setup.rolesEnabled[roleId] = true;
        normalizeRoleCounts(state);
        return;
    }
    state.setup.rolesEnabled[roleId] = !!enabled;
    
    if (!enabled) {
        state.setup.rolesCounts[roleId] = 0;
    } else {
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
    if (alive.length === 0) return 'tie';
    
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
		
		const currentVillici = state.setup.rolesCounts['villico'] || 0;
		const neededVillici = numPlayers - totalRoles + currentVillici;
		
		if (neededVillici > 0) {
			console.log(`Adjusting villico count from ${currentVillici} to ${neededVillici}`);
			state.setup.rolesCounts['villico'] = neededVillici;
		} else if (neededVillici < 0) {
			console.warn(`Too many roles (${totalRoles}) for ${numPlayers} players. This shouldn't happen.`);
		}
	}
}

export function beginReveal(state: GameState, roleList: any[], shuffled: (a: string[]) => string[]): void {
	validateAndFixRoleCounts(state);
	
	const pool: string[] = [];
	
	console.log('beginReveal called with:', {
		roleList: roleList.map(r => ({ id: r.id, name: r.name })),
		rolesCounts: state.setup.rolesCounts,
		rolesEnabled: state.setup.rolesEnabled,
		numPlayers: state.setup.numPlayers
	});
	
	for (const role of roleList) {
		const count = state.setup.rolesCounts[role.id] || 0;
		const isEnabled = state.setup.rolesEnabled?.[role.id] !== false;
		if (count > 0 && isEnabled) {
			for (let i = 0; i < count; i += 1) pool.push(role.id);
		}
	}
	
	console.log('Role pool created:', pool);
	
	if (pool.length !== state.setup.numPlayers) {
		console.error(`Critical error: Role pool size (${pool.length}) doesn't match player count (${state.setup.numPlayers})`);
		console.error('Role counts:', state.setup.rolesCounts);
		console.error('Roles enabled:', state.setup.rolesEnabled);
		
		const missingRoles = state.setup.numPlayers - pool.length;
		if (missingRoles > 0) {
			console.warn(`Attempting to fix by adding ${missingRoles} villico roles`);
			for (let i = 0; i < missingRoles; i++) {
				pool.push('villico');
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
			roleId: roleId || 'villico',
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
	
	// If skipFirstNightActions is enabled, adjust startNight values for all players
	// This ensures that roles with startNight: 2 can actually start on night 3 (since night 1 is skipped)
	if (state.settings?.skipFirstNightActions) {
		for (const player of state.players) {
			if (player.roleState?.startNight && player.roleState.startNight > 1) {
				player.roleState.startNight += 1;
			}
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
    if (!(state as any).usedPowers) (state as any).usedPowers = {};
    
    if (!(state as any).deadAtNightStart) (state as any).deadAtNightStart = {};
    (state as any).deadAtNightStart[state.nightNumber] = state.players.filter(p => !p.alive).map(p => p.id);
    

    
    const uniqueRoles = new Set(state.players.map(p => p.roleId));
    
    // Separate roles that can act at night from those that only have passive effects
    const rolesWithPrompts = [];
    const rolesWithPassiveOnly = [];
    
    for (const roleId of uniqueRoles) {
        const roleDef = roles[roleId];
        if (!roleDef) continue;
        
        const rolePlayers = state.players.filter(p => p.roleId === roleId);
        const roleInfo = {
            roleId,
            roleDef,
            players: rolePlayers,
            phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any'
        };
        
        if (roleDef.actsAtNight !== "never") {
            // Roles that can act at night (show prompts)
            rolesWithPrompts.push(roleInfo);
        } else if (typeof roleDef.passiveEffect === 'function') {
            // Roles that can't act but have passive effects
            rolesWithPassiveOnly.push(roleInfo);
        }
    }
    
    // Sort roles with prompts by phase order
    rolesWithPrompts.sort((a, b) => {
        const aOrder = a.phaseOrder;
        const bOrder = b.phaseOrder;
        
        if (aOrder === "any" && bOrder === "any") {
            return a.roleId.localeCompare(b.roleId);
        }
        
        if (aOrder === "any") return 1;
        if (bOrder === "any") return -1;
        
        const aNum = Number(aOrder);
        const bNum = Number(bOrder);
        
        if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
            return aNum - bNum;
        }
        
        if (Number.isFinite(aNum)) return -1;
        if (Number.isFinite(bNum)) return 1;
        
        return a.roleId.localeCompare(b.roleId);
    });
    
    const turns = rolesWithPrompts.map(role => ({
        kind: 'group' as const,
        roleId: role.roleId,
        playerIds: role.players.map(p => p.id)
    }));
    
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
    
    // Apply passive effects to roles that can't act at night
    for (const roleInfo of rolesWithPassiveOnly) {
        const { roleDef, players } = roleInfo;
        if (typeof roleDef.passiveEffect === 'function') {
            for (const player of players) {
                if (player.alive) {
                    try {
                        roleDef.passiveEffect(state as any, player);
                    } catch (error) {
                        console.error(`Error in passive effect for ${roleInfo.roleId} (player ${player.id}):`, error);
                    }
                }
            }
        }
    }
    
	state.phase = 'night';
}

export function recordNightResult(state: GameState, result: any): void {
	const entry = state.night.turns[state.night.currentIndex];
	if (!entry) return;

	if (entry.kind === 'group') {
		const roleDef = ROLES[entry.roleId];
		const playerIds = (entry as any).playerIds || [];
		
		// Check if this is the first night and first night actions are skipped
		const isFirstNightSkipped = state.settings?.skipFirstNightActions && state.nightNumber === 1;
		
		if (!isFirstNightSkipped) {
			// Only run passive effects if not first night skipped
			const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
			
			if (roleDef && typeof roleDef.passiveEffect === 'function') {
				for (const playerId of playerIds) {
					const player = state.players.find(p => p.id === playerId);
					if (player && player.alive) {
						try {
							roleDef.passiveEffect(state as any, player);
						} catch (error) {
							console.error(`Error in passive effect for ${entry.roleId} (player ${playerId}):`, error);
						}
					}
				}
			}

			if (!state.history) (state as any).history = {} as any;
			if (!(state as any).history[state.nightNumber]) (state as any).history[state.nightNumber] = {};

			if (result?.skipped === true) {
				// Role was explicitly skipped by player choice
				(state as any).history[state.nightNumber][entry.roleId] = "skipped";
			} else if (result?.blocked === true) {
				// Role was blocked by another role
				(state as any).history[state.nightNumber][entry.roleId] = "blocked";
			} else {
				// Check if role can act based on constraints
				const constraintCheck = checkRoleConstraints(state, entry.roleId, playerIds);
				
				if (constraintCheck !== null) {
					// Role cannot act due to constraints
					(state as any).history[state.nightNumber][entry.roleId] = constraintCheck;
				} else if (isRoleUsed(result)) {
					// Role was actually used (has meaningful data)
					if (!(state as any).usedPowers) (state as any).usedPowers = {};
					if (!(state as any).usedPowers[entry.roleId]) (state as any).usedPowers[entry.roleId] = [];
					for (const playerId of playerIds) {
						(state as any).usedPowers[entry.roleId].push(playerId);
					}
						
					const action = {
						roleId: entry.roleId,
						kind: entry.kind,
						playerId: playerIds[0],
						playerIds: playerIds,
						data: result
					};
						
					if (roleDef && typeof roleDef.resolve === 'function') {
						// Each role's resolve function returns its own history object
						const roleHistory = roleDef.resolve(state as any, action);
						
						if (roleHistory) {
							// Store the role's history object
							(state as any).history[state.nightNumber][entry.roleId] = roleHistory;
						} else {
							// Fallback to generic history if role doesn't return anything
							(state as any).history[state.nightNumber][entry.roleId] = {
								type: `${entry.roleId}_action`,
								nightNumber: state.nightNumber,
								roleId: entry.roleId,
								playerIds: playerIds,
								data: result,
								groupAction: true
							};
						}
					} else {
						// Role has no resolve function, create generic history
						(state as any).history[state.nightNumber][entry.roleId] = {
							type: `${entry.roleId}_action`,
							nightNumber: state.nightNumber,
							roleId: entry.roleId,
							playerIds: playerIds,
							data: result,
							groupAction: true
						};
					}
				} else {
					// Role can act but wasn't used (no meaningful data provided)
					(state as any).history[state.nightNumber][entry.roleId] = "skipped";
				}
			}
		}
		// If first night is skipped, we don't add anything to history - the role is processed but no history entry is created
	}
	
	if (state.night.currentIndex < state.night.turns.length - 1) {
		state.night.currentIndex += 1;
	} else {
		state.phase = 'resolve';
	}
}

function isRoleUsed(result: any): boolean {
	if (!result || typeof result !== 'object') return false;
	
	// Explicit used/skipped flags - these take priority
	if (result.used === true) return true;
	if (result.used === false || result.skipped === true) return false;
	
	// Check for meaningful data that indicates the role was used
	const hasTargetId = result.targetId !== null && result.targetId !== undefined;
	const hasTarget = result.target !== null && result.target !== undefined;
	const hasAction = result.action && result.action !== 'none';
	const hasChoice = result.choice !== null && result.choice !== undefined;
	const hasRoleId = result.roleId !== null && result.roleId !== undefined;
	
	// If any meaningful data is present, consider the role used
	return hasTargetId || hasTarget || hasAction || hasChoice || hasRoleId;
}

function checkRoleConstraints(state: GameState, roleId: string, playerIds: number[]): string | null {
	const roleDef = ROLES[roleId];
	if (!roleDef) return null;

	const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
	const deadMembers = state.players.filter(p => playerIds.includes(p.id) && !p.alive);

	// Check if all players with this role are blocked
	if (aliveMembers.length > 0 && aliveMembers.every(player => 
		player.roleState?.actsAtNight === 'blocked'
	)) {
		return "blocked";
	}

	// Check if all players with this role are dead and role requires alive players
	if (aliveMembers.length === 0 && roleDef.actsAtNight === 'alive') {
		return "dead";
	}

	// Check if all players with this role are alive and role requires dead players
	if (deadMembers.length === 0 && roleDef.actsAtNight === 'dead') {
		return "alive";
	}

	// Check if role has reached usage limit
	const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
	const hasUsageLimit = rolePlayers.some(player => {
		const numberOfUsage = player.roleState?.numberOfUsage;
		if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
		
		const usedPowers = (state as any).usedPowers?.[roleId] || [];
		const timesUsed = usedPowers.filter((playerId: number) => playerId === player.id).length;
		return timesUsed >= numberOfUsage;
	});
	
	if (hasUsageLimit) {
		return "usageLimit";
	}

	// Check if role cannot be used yet due to startNight restriction
	const hasStartNightRestriction = rolePlayers.some(player => {
		// Check both the role definition and the player's role state
		const roleStartNight = roleDef.startNight;
		const playerStartNight = player.roleState?.startNight;
		const startNight = playerStartNight || roleStartNight;
		return startNight && typeof startNight === 'number' && state.nightNumber < startNight;
	});
	
	if (hasStartNightRestriction) {
		return "startNight";
	}

	return null;
}

function rolesUsageOf(state: GameState, roleId: string): 'unlimited' | 'once' | 'requiredEveryNight' | undefined {
    const meta: any = ROLES[roleId];
    // Use the new system, but provide backward compatibility
    if (meta?.numberOfUsage === 'unlimited') return 'unlimited';
    if (meta?.numberOfUsage === 1) return 'once';
    if (meta?.effectType === 'required') return 'requiredEveryNight';
    // Fallback to old system
    return meta?.usage;
}

export function resolveNight(state: GameState, roles: RolesRegistry): void {
    if (!state.night) return;
    
    // Roles are now resolved immediately in recordNightResult, so we only need to create the night summary
    
    // Create night summary from context
    if (state.night.context) {
        const context = state.night.context;
        
        // Get players who were dead at the start of the night
        const deadAtNightStart = (state as any).deadAtNightStart?.[state.nightNumber] || [];
        
        const summary: any = {
            died: [],
            saved: [],
            targeted: [],
            resurrected: [],
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

        // Detect resurrected players: those who were dead at night start but are now alive
        for (const playerId of deadAtNightStart) {
            const player = state.players.find(p => p.id === playerId);
            if (player && player.alive) {
                summary.resurrected.push(playerId);
            }
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
		{ id: 2, name: 'Giocatore 2', roleId: 'lupo', alive: true, roleState: {} as any },
		{ id: 3, name: 'Giocatore 3', roleId: 'villico', alive: true, roleState: {} as any },
		{ id: 4, name: 'Giocatore 4', roleId: 'villico', alive: true, roleState: {} as any },
		{ id: 5, name: 'Giocatore 5', roleId: 'guardia', alive: true, roleState: {} as any },
		{ id: 6, name: 'Giocatore 6', roleId: 'guardia', alive: true, roleState: {} as any },
		{ id: 7, name: 'Giocatore 7', roleId: 'veggente', alive: true, roleState: {} as any },
	];
	
	for (const player of state.players) {
		const roleDef = ROLES[player.roleId];
		if (roleDef) {
			initializePlayerRoleState(player, roleDef);
		}
	}
	
	state.setup.numPlayers = state.players.length;
	state.setup.players = state.players.map(p => ({ name: p.name }));
	state.setup.rolesCounts = { insinuo: 1, lupo: 1, villico: 2, guardia: 2, veggente: 1 };
	
	state.custom = {};
	state.history = {};
	
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
    
    // Immediate win for Matto if lynched
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


