import type { GameState, NightTurn, Player } from '../stores/game';
import type { RoleDef } from '../types';
import { ROLES as ROLE_DEFS } from '../roles';

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
        // Default active roles: only Villager and Wolf
        state.setup.rolesEnabled = { wolf: true, villager: true } as Record<string, boolean>;
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
    // No normalization beyond keeping integers and non-negative, and honoring disabled roles
    for (const key of Object.keys(roles)) {
        roles[key] = Math.max(0, Math.floor(Number(roles[key]) || 0));
        if (enabled && enabled[key] === false) roles[key] = 0;
    }
}

export function updateRoleCount(state: GameState, roleId: string, count: number): void {
    const counts = state.setup.rolesCounts;
    const min = getMinCountForRole(state, roleId);
    const max = getMaxCountForRole(state, roleId);
    const next = Math.floor(Number(count) || 0);
    counts[roleId] = Math.max(min, Math.min(max, next));
}

export function getMaxCountForRole(state: GameState, roleId: string): number {
    const n = state.setup.numPlayers;
    // If the registry defines maxCount as a function/number, use it. Fallback to players.
    const roleDef = (ROLE_DEFS as any)?.[roleId] as any;
    const maxFromDef = roleDef?.maxCount;
    // If no max is provided, treat as Infinity
    const resolved = typeof maxFromDef === 'function' ? Number(maxFromDef(state)) : (typeof maxFromDef === 'number' ? Number(maxFromDef) : Infinity);
    const cap = Number.isFinite(resolved) ? resolved : Infinity;
    // Always cap by number of players
    return Math.max(0, Math.min(n, Math.floor(isFinite(cap) ? cap : n)));
}

export function getMinCountForRole(state: GameState, roleId: string): number {
    const roleDef = (ROLE_DEFS as any)?.[roleId] as any;
    const minFromDef = roleDef?.minCount;
    const resolved = typeof minFromDef === 'function' ? Number(minFromDef(state)) : Number(minFromDef);
    const min = Number.isFinite(resolved) ? resolved : 1;
    return Math.max(0, Math.floor(min));
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
    // If only one team remains alive, that's an automatic win unless blocked
    const trivial = computeWinner(state);
    const alivePlayers = getAlivePlayers(state);

    // If any alive role blocks the win, no winner
    for (const p of alivePlayers) {
        const def = roles[p.roleId];
        if (def && typeof def.checkWinConstraint === 'function') {
            try { if (def.checkWinConstraint(state as any)) return null; } catch {}
        }
    }

    if (trivial) return trivial;

    // Let roles declare their faction win (dumb engine)
    for (const p of alivePlayers) {
        const def = roles[p.roleId];
        if (def && typeof def.checkWin === 'function') {
            try {
                if (def.checkWin(state as any)) {
                    const team = state.roleMeta[p.roleId]?.team || def.team;
                    return team || null;
                }
            } catch {}
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


