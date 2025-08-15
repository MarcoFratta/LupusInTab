import type { GameState, NightTurn, Player } from '../stores/game';
import type { RoleDef } from '../types';

export type RolesRegistry = Record<string, RoleDef>;

export interface RoleListItem {
    id: string;
    name: string;
    team: string;
    visibleAsTeam?: string;
    phaseOrder: number;
}

export function createEmptyState(): GameState {
	return {
		phase: 'setup',
		nightNumber: 0,
		dayNumber: 0,
		players: [],
		roleMeta: {},
        setup: { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: { wolf: true, villager: true, doctor: true, medium: true, lover: false, crazyman: false, justicer: false, hangman: false, witch: false, dog: false, demoniac: false } },
		revealIndex: 0,
		night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
		settings: { skipFirstNightActions: true, enableSindaco: false },
        sindacoId: null as any,
		winner: null,
        lynchedHistory: [],
	};
}

// Setup helpers
export function initSetupPlayers(state: GameState): void {
	state.setup.players = Array.from({ length: state.setup.numPlayers }, (_, i) => ({ name: `Giocatore ${i + 1}` }));
	initDefaultRolesCounts(state);
}

export function initDefaultRolesCounts(state: GameState): void {
	const n = state.setup.numPlayers;
	const wolves = Math.max(1, Math.floor(n / 4));
	const doctor = n >= 5 ? 1 : 0;
	const medium = n >= 6 ? 1 : 0;
	const used = wolves + doctor + medium;
	const villager = Math.max(0, n - used);
    state.setup.rolesCounts = { wolf: wolves, doctor, medium, villager } as Record<string, number>;
    // initialize enabled roles if missing
    if (!state.setup.rolesEnabled) {
        state.setup.rolesEnabled = { wolf: true, villager: true, doctor: doctor > 0, medium: medium > 0, lover: false, crazyman: false, justicer: false, hangman: false, witch: false, dog: false, demoniac: false } as Record<string, boolean>;
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
    const n = state.setup.numPlayers;
    const roles = state.setup.rolesCounts;
    const enabled = state.setup.rolesEnabled || {};
    // Apply generic floor for existing roles
    roles.wolf = Math.max(0, Math.floor(Number(roles.wolf) || 0));
    roles.doctor = Math.max(0, Math.floor(Number(roles.doctor) || 0));
    roles.medium = Math.max(0, Math.floor(Number(roles.medium) || 0));
    if (typeof roles.lover !== 'undefined') roles.lover = Math.max(0, Math.floor(Number(roles.lover) || 0));
    if (typeof roles.crazyman !== 'undefined') roles.crazyman = Math.max(0, Math.floor(Number(roles.crazyman) || 0));
    if (typeof roles.justicer !== 'undefined') roles.justicer = Math.max(0, Math.floor(Number(roles.justicer) || 0));

    // Role-specific constraints
    // Wolves: min 1; max = ceil((n-1)/2) - 1 i.e. strictly less than half → Math.floor((n-1)/2)
    const wolvesMin = 1;
    const wolvesMax = Math.max(1, Math.floor((n - 1) / 2));
    roles.wolf = Math.min(Math.max(roles.wolf, wolvesMin), wolvesMax);

    // Lovers: either 0 or 2 if present in counts
    if (typeof roles.lover !== 'undefined') {
        const loverCount = Math.max(0, Math.floor(Number(roles.lover) || 0));
        roles.lover = loverCount === 1 ? 2 : (loverCount >= 2 ? 2 : 0);
    }

    // Apply enabled toggles: if a role is disabled, set its count to 0 except villager and wolf which are always enabled
    for (const key of Object.keys(roles)) {
        if (key === 'villager' || key === 'wolf') continue;
        if (enabled && enabled[key] === false) {
            roles[key] = 0;
        }
    }

    // Enforce minimums for enabled roles (excluding villager which can be 0)
    for (const key of Object.keys(roles)) {
        if (key === 'villager') continue;
        if (enabled && enabled[key] === false) continue;
        if (key === 'lover') {
            // If lovers are enabled, minimum is 2
            roles[key] = Math.max(2, Number(roles[key]) || 0);
            continue;
        }
        if (key === 'crazyman' || key === 'justicer') {
            roles[key] = Math.max(1, Math.min(1, Number(roles[key]) || 0));
            continue;
        }
        if (key !== 'wolf') {
            roles[key] = Math.max(1, Number(roles[key]) || 0);
        }
    }

    // Villagers can be any non-negative number; we try to fill remaining slots automatically after enforcing mins
    const sumOthers = Object.entries(roles)
        .filter(([k]) => k !== 'villager')
        .reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
    const remaining = Math.max(0, n - sumOthers);
    roles.villager = remaining;
}

export function updateRoleCount(state: GameState, roleId: string, count: number): void {
    if (roleId === 'lover') {
        // Lovers only allow 0 or 2. Any value < 2 becomes 0; >= 2 becomes 2
        state.setup.rolesCounts[roleId] = count >= 2 ? 2 : 0;
        normalizeRoleCounts(state);
        return;
    }
    state.setup.rolesCounts[roleId] = count;
    normalizeRoleCounts(state);
}

export function getMaxCountForRole(state: GameState, roleId: string): number {
    const n = state.setup.numPlayers;
    if (roleId === 'wolf') return Math.max(1, Math.floor((n - 1) / 2));
    if (roleId === 'lover') return Math.min(2, n);
    if (roleId === 'villager') return n;
    if (roleId === 'crazyman') return 1;
    if (roleId === 'justicer') return 1;
    if (roleId === 'dog') return 1;
    return Math.min(2, n - 1);
}

export function getMinCountForRole(state: GameState, roleId: string): number {
    const enabled = state.setup.rolesEnabled || {};
    if (roleId === 'villager') return 0;
    if (roleId === 'wolf') return 1;
    if (roleId === 'lover') return (enabled.lover === false) ? 0 : 2;
    return (enabled[roleId] === false) ? 0 : 1;
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
    // when disabling a role, set its count to 0; when enabling, leave counts as-is and normalize
    if (!enabled) {
        state.setup.rolesCounts[roleId] = 0;
    }
    normalizeRoleCounts(state);
}

// Selectors
export function getAlivePlayers(state: GameState): Player[] {
	return state.players.filter(p => p.alive);
}

export function getWolvesAlive(state: GameState): Player[] {
    return getAlivePlayers(state).filter(p => state.roleMeta[p.roleId]?.team === 'lupi');
}

export function getVillagersAlive(state: GameState): Player[] {
    return getAlivePlayers(state).filter(p => state.roleMeta[p.roleId]?.team !== 'lupi');
}

export function computeWinner(state: GameState): GameState['winner'] {
    const alive = getAlivePlayers(state);
    const aliveTeams = new Set<string>(alive.map(p => state.roleMeta[p.roleId]?.team).filter(Boolean) as string[]);
    if (aliveTeams.size === 1) {
        return Array.from(aliveTeams)[0] || null;
    }
    return null;
}

/**
 * Evaluate custom win conditions by iterating alive players and invoking their role's checkWin.
 * Returns the winning team id, or null.
 */
export function evaluateWinner(state: GameState, roles: RolesRegistry): GameState['winner'] {
    // If only one team remains alive, that's an automatic win
    const trivial = computeWinner(state);
    if (trivial) return trivial;
    
    const alivePlayers = getAlivePlayers(state);
    
    // Check high-priority roles first (roles that can win alone and should take precedence)
    const priorityRoles = ['dog']; // Dog should win with priority when its condition is met
    for (const roleId of priorityRoles) {
        const player = alivePlayers.find(p => p.roleId === roleId);
        if (player) {
            const roleDef = roles[player.roleId];
            if (roleDef && typeof roleDef.checkWin === 'function') {
                try {
                    if (roleDef.checkWin(state as any)) {
                        const team = state.roleMeta[player.roleId]?.team || roleDef.team;
                        return team || null;
                    }
                } catch {
                    // ignore faulty role checkers
                }
            }
        }
    }
    
    // Then check other roles
    for (const player of alivePlayers) {
        if (priorityRoles.includes(player.roleId)) continue; // Skip already checked priority roles
        
        const roleDef = roles[player.roleId];
        if (roleDef && typeof roleDef.checkWin === 'function') {
            try {
                if (roleDef.checkWin(state as any)) {
                    const team = state.roleMeta[player.roleId]?.team || roleDef.team;
                    return team || null;
                }
            } catch {
                // ignore faulty role checkers
            }
        }
    }
    return null;
}

// Game flow
export function beginReveal(state: GameState, roleList: RoleListItem[], shuffled: (a: string[]) => string[]): void {
	const meta: Record<string, any> = {};
    for (const role of roleList) {
        meta[role.id] = {
            id: role.id,
            name: role.name,
            team: role.team,
            visibleAsTeam: (role as any).visibleAsTeam || role.team,
            description: (role as any).description,
            color: (role as any).color,
            phaseOrder: role.phaseOrder,
            usage: (role as any).usage,
            canTargetDead: (role as any).canTargetDead,
            immuneToKillers: (role as any).immuneToKillers,
            countsAsWolfForWin: (role as any).countsAsWolfForWin,
            revealAlliesWithinTeam: (role as any).revealAlliesWithinTeam,
            knownToTeams: (role as any).knownToTeams,
            revealPartnersRoleIds: (role as any).revealPartnersRoleIds,
            revealToAllies: (role as any).revealToAllies,
            revealToPartners: (role as any).revealToPartners,
        };
    }
	state.roleMeta = meta;
	const pool: string[] = [];
	for (const role of roleList) {
		const count = state.setup.rolesCounts[role.id] || 0;
		for (let i = 0; i < count; i += 1) pool.push(role.id);
	}
	const randomized = shuffled(pool);
	state.players = state.setup.players.map((p, idx) => ({ id: idx + 1, name: p.name?.trim() || `Giocatore ${idx + 1}`, roleId: randomized[idx], alive: true }));
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
			const role = roles[p.roleId];
			if (!role) return false;
			if (role.actsAtNight === false) return false;
			return typeof role.getPromptComponent === 'function' || typeof role.getGroupPromptComponent === 'function';
		})
		.sort((a, b) => (state.roleMeta[a.roleId]?.phaseOrder || 99) - (state.roleMeta[b.roleId]?.phaseOrder || 99));
	const visitedGroup = new Set<string>();
	const turns: NightTurn[] = [];
	const aliveIds = new Set(getAlivePlayers(state).map(p => p.id));
	for (const p of sortedByRole) {
		const roleDef = roles[p.roleId];
		if (roleDef?.group) {
			if (!visitedGroup.has(p.roleId)) {
				const groupPlayersAlive = state.players.filter(x => x.roleId === p.roleId && aliveIds.has(x.id)).map(x => x.id);
				turns.push({ kind: 'group', roleId: p.roleId, playerIds: groupPlayersAlive });
				visitedGroup.add(p.roleId);
			}
			continue;
		}
		turns.push({ kind: 'single', roleId: p.roleId, playerId: p.id });
	}
    state.night = { turns, currentIndex: 0, results: [], context: { pendingKills: {}, saves: [], savesBy: [], checks: [] }, summary: null } as any;
	state.phase = 'night';
}

export function recordNightResult(state: GameState, result: any): void {
	const entry = state.night.turns[state.night.currentIndex];
	if (!entry) return;
	(state.night.results as any[]).push({
		roleId: entry.roleId,
		kind: entry.kind,
		playerId: entry.kind === 'single' ? (entry as any).playerId : undefined,
		playerIds: entry.kind === 'group' ? (entry as any).playerIds : undefined,
		result,
	});
    // Track one-time power usage
    if (entry.kind === 'single') {
        const roleDef = (state as any).roleMeta[entry.roleId];
        const registryUsage = rolesUsageOf(state, entry.roleId);
        if (registryUsage === 'once' && (result?.used === true)) {
            if (!(state as any).usedPowers) (state as any).usedPowers = {};
            const list = (state as any).usedPowers[entry.roleId] || [];
            if (!list.includes((entry as any).playerId)) list.push((entry as any).playerId);
            (state as any).usedPowers[entry.roleId] = list;
        }
    }
	if (state.night.currentIndex < state.night.turns.length - 1) {
		state.night.currentIndex += 1;
	} else {
		state.phase = 'resolve';
	}
}

function rolesUsageOf(state: GameState, roleId: string): 'unlimited' | 'once' | 'requiredEveryNight' | undefined {
    const meta: any = (state as any).roleMeta?.[roleId];
    return meta?.usage;
}

export function resolveNight(state: GameState, roles: RolesRegistry): void {
	if (state.settings?.skipFirstNightActions && state.nightNumber === 1) {
        state.night.context = { pendingKills: {}, saves: [], savesBy: [], checks: [] } as any;
        state.night.summary = { targeted: [], saved: [], died: [], checks: [] } as any;
		// After resolving (skipped) night, check win conditions immediately
		const winner0 = evaluateWinner(state, roles);
		if (winner0) {
			state.winner = winner0;
			state.phase = 'end';
		}
		return;
	}
    state.night.context = { pendingKills: {}, saves: [], savesBy: [], checks: [] } as any;
	for (const entry of state.night.results) {
		const role = roles[(entry as any).roleId];
		if (role && typeof role.resolve === 'function') role.resolve(state as any, entry);
	}
    const pending: Record<number, string[]> = state.night.context.pendingKills || {};
    const allTargets = Object.keys(pending).map(k => Number(k)).filter(n => Number.isFinite(n));
    const targetedSet = new Set<number>(allTargets);
    const saveSet = new Set<number>(state.night.context.saves || []);
	const died: number[] = [];
    for (const targetId of targetedSet) {
        if (!saveSet.has(targetId) && (pending[targetId]?.length || 0) > 0) {
			const target = state.players.find(p => p.id === targetId);
			if (target && target.alive) {
                // If target is immune to some killers, remove those kills
                const targetMeta: any = state.roleMeta[target.roleId] || {};
                const immuneTo: string[] = targetMeta.immuneToKillers || [];
                if (immuneTo.length) {
                    const remaining = (pending[targetId] || []).filter(k => !immuneTo.includes(k));
                    pending[targetId] = remaining;
                }
                if ((pending[targetId]?.length || 0) === 0) continue;
				target.alive = false;
				died.push(targetId);
			}
		}
	}
	state.night.summary = {
        targeted: Array.from(targetedSet),
		saved: Array.from(saveSet),
		died,
		checks: (state.night.context.checks || []).slice(),
	} as any;

	// Store night summary and results in event history
	if (!state.eventHistory) state.eventHistory = { nights: [], days: [] };
	state.eventHistory.nights.push({
		night: state.nightNumber,
		summary: { ...state.night.summary },
		results: [...state.night.results]
	});

	// After applying deaths and constructing summary, check win conditions immediately
	const winner = evaluateWinner(state, roles);
	if (winner) {
		state.winner = winner;
		state.phase = 'end';
	}
}

export function continueToDay(state: GameState): void {
    const winner = computeWinner(state);
	if (winner) {
		state.winner = winner;
		state.phase = 'end';
		return;
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


// Day phase helpers
export function lynchPlayer(state: GameState, playerId: number): void {
    const target = state.players.find(p => p.id === playerId);
    if (!target || !target.alive) return;
    target.alive = false;
    if (!Array.isArray((state as any).lynchedHistory)) (state as any).lynchedHistory = [];
    (state as any).lynchedHistory.push(target.id);
    
    // Store day event in history
    if (!state.eventHistory) state.eventHistory = { nights: [], days: [] };
    state.eventHistory.days.push({
        day: state.dayNumber,
        lynched: playerId
    });
    
    // Immediate win for Crazyman if lynched
    const roleTeam = state.roleMeta[target.roleId]?.team;
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


