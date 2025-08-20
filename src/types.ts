import {Phase} from "./stores/game";

export type Team = string;

export interface FactionConfig {
	id: string;
	name: string;
	displayName: string;
	color: string;
	ringColor: string;
	winConditionDescription: string;
}

export interface RoleEvent {
	type: string;
	nightNumber: number;
	playerId: number;
	data: any;
}

export interface PlayerHistory {
	[nightNumber: number]: RoleEvent[];
}

export interface GameHistory {
	[playerId: number]: PlayerHistory;
}

export interface RoleDef {
	id: string;
	name: string;
	team: Team;
    /**
     * How this role is seen by investigative roles (e.g., medium).
     * Defaults to `team` when not provided.
     */
    visibleAsTeam?: Team;
    /**
     * Which faction this role counts as for win condition calculations.
     * Defaults to `team` when not provided.
     * Example: indemoniato plays for lupi but counts as villaggio for win conditions.
     */
    countAs?: Team;
    /** If false, players of this role won't automatically see allies of the same role during reveal */
    revealAlliesWithinRole?: boolean;
    /** Short description to show under the role name on reveal */
    description?: string;
    /** Hex color (e.g. #ef4444) used as role identifier color in UI */
    color?: string;
	/**
	 * Order in which this role acts during the night phase.
	 * Lower numbers act first. Use "any" for roles that can act in any order.
	 * Critical for roles with causal dependencies (e.g., wolves must act before doctors).
	 */
	phaseOrder: number | "any";
	group?: boolean;
	/** 
	 * When this role can act during the night phase:
	 * - "always": can use the role always at night
	 * - "alive": can use the role only when alive
	 * - "dead": can use the role only when dead
	 * - "never": no usage at night
	 */
	actsAtNight?: "always" | "alive" | "dead" | "never" | "blocked";
    /**
     * Usage policy for the role's power.
     * - 'unlimited': may act any night as allowed
     * - 'once': may act only once per match
     * - 'requiredEveryNight': must act every night (engine will still remain dumb; prompts can enforce)
     * @deprecated Use effectType and numberOfUsage instead
     */
    usage?: 'unlimited' | 'once' | 'requiredEveryNight';
    
    /**
     * Whether the role effect is optional or required.
     * - 'optional': Player can choose to use or skip
     * - 'required': Player must use the effect
     */
    effectType?: 'optional' | 'required';
    
    /**
     * Number of times the role can be used per game.
     * - number: Specific number of uses (e.g., 3)
     * - 'unlimited': Can be used every night
     */
    numberOfUsage?: number | 'unlimited';
    
    /**
     * The night number from which the player can start using the effect.
     * - 1: Can use from first night (default)
     * - 2: Can use from second night onwards
     * - etc.
     */
    startNight?: number;
    /**
     * Whether this role is allowed to target dead players.
     */
    canTargetDead?: boolean;
    /**
     * For roles that interact with other roles' actions (e.g., Doctor), which roleIds are affected by this role's power.
     * Example: ['wolf'] means it can counter kills initiated by wolves.
     */
    affectedRoles?: string[];
    /** If present, killers in this list cannot kill this role (are ignored at resolve) */
    immuneToKillers?: string[];
    /**
     * Roles that should be able to see this role during the reveal phase.
     * Example: an executioner might set knownTo: ['wolf'] so Wolves see who the executioner is.
     * Values are roleIds, not teams.
     */
    knownTo?: string[];
    /**
     * During reveal, show other players who have any of these roleIds as partners/allies to the current player.
     * Example: lovers could set revealPartnersRoleIds: ['lover'] so each lover sees the other lover.
     */
    revealPartnersRoleIds?: string[];
    /** How this role should be displayed to faction allies during reveal ('role' shows role name, 'team' shows only faction) */
    revealToAllies?: 'role' | 'team';
    /** How this role should be displayed to its partners during reveal ('role' shows role name, 'team' shows only faction) */
    revealToPartners?: 'role' | 'team';
    /**
     * Setup constraints for how many copies of this role can be selected.
     * If not specified, role can be 0..N.
     */
    minCount?: number | ((state: any) => number);
    maxCount?: number | ((state: any) => number);
    /** If provided, the allowed counts must be one of these values (computed dynamically). */
    allowedCounts?: number[] | ((state: any) => number[]);
    getPromptComponent?: (gameState: any, player: any) => () => Promise<any>;
    getGroupPromptComponent?: (gameState: any, entry: any) => () => Promise<any>;
    /** Optional component factory to render per-actor resolve details (single roles) */
    getResolveDetailsComponent?: (gameState: any, entry: any) => () => Promise<any>;
    /** Optional component factory to render grouped resolve details (group roles) */
    getGroupResolveDetailsComponent?: (gameState: any, entry: any) => () => Promise<any>;
    resolve: (gameState: any, entry: any) => void;
    /**
     * Optional function to restore any temporary state changes made during the night phase.
     * Called during the day phase in reverse order of night phase execution.
     */
    restoreFunction?: (gameState: any) => void;
    /**
     * Optional passive effect that runs every night regardless of blocking status.
     * Called in phase order but without showing prompts. Useful for automatic protections
     * or other effects that should always work.
     */
    passiveEffect?: (gameState: any, player: any) => void;
    /**
     * Optional per-role win check. It should return true when this role's faction has met its winning condition.
     */
    checkWin?: (gameState: any) => boolean;
    /**
     * Optional per-role blocker. Return true if this role blocks declaring any winner (e.g., Dog alive blocks wins).
     */
    checkWinConstraint?: (gameState: any) => boolean;
}

export interface PlayerRoleState {
    // Runtime properties that can change during the game
    visibleAsTeam?: Team;  // Can be modified by Insinuo
    actsAtNight: "always" | "alive" | "dead" | "never" | "blocked"; // Can be modified by Illusionista
    
    // Static properties copied from role definition (never change)
    realTeam: Team;
    countAs: Team;
    phaseOrder: number | "any";
    usage: 'unlimited' | 'once' | 'requiredEveryNight';
    effectType: 'optional' | 'required';
    numberOfUsage: number | 'unlimited';
    startNight: number;
    canTargetDead: boolean;
    affectedRoles: string[];
    immuneToKillers: string[];
    knownTo: string[];
    revealPartnersRoleIds: string[];
    revealAlliesWithinRole: boolean;
    revealToAllies: 'role' | 'team';
    revealToPartners: 'role' | 'team';
}

export interface Player {
    id: number;
    name: string;
    roleId: string;
    alive: boolean;
    roleState: PlayerRoleState;
}

export interface GameState {
	phase: Phase;
	nightNumber: number;
	dayNumber: number;
	players: Player[];
	setup: { numPlayers: number; players: Array<{ name: string }>; rolesCounts: Record<string, number>; rolesEnabled: Record<string, boolean> };
	revealIndex: number;
	night: { turns: NightTurn[]; currentIndex: number; context: any; summary: NightSummary | null };
	settings: { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean };
    sindacoId: number | null;
	    winner: string | null | 'tie';
    lynchedHistory?: number[];
    usedPowers?: Record<string, number[]>;
    eventHistory?: EventHistory;
    custom?: Record<string, any>;
    history?: GameHistory;
    nightDeathsByNight?: Record<number, number[]>;
    lynchedHistoryByDay?: Record<number, number[]>;
}

export interface NightTurnSingle { kind: 'single'; roleId: string; playerId: number }
export interface NightTurnGroup { kind: 'group'; roleId: string; playerIds: number[] }
export type NightTurn = NightTurnSingle | NightTurnGroup;

export interface NightSummary { 
    targeted: number[]; 
    saved: number[]; 
    died: number[]; 
    resurrected: number[];
    checks: Array<{by:number; target:number; team:string}> 
}

export interface DaySummary { lynched: number | null; day: number; }

export interface EventHistory {
    nights: Array<{ night: number; summary: NightSummary; results: any[] }>;
    days: Array<DaySummary>;
}

export type RolesRegistry = Record<string, RoleDef>;

// Utility function to get a player's role state
export function getPlayerRoleState(gameState: GameState, playerId: number): PlayerRoleState | undefined {
    const player = gameState.players.find(p => p.id === playerId);
    return player?.roleState;
}

// Utility function to get a player's visible team (considering Insinuo effects)
export function getPlayerVisibleTeam(gameState: GameState, playerId: number): Team | undefined {
    const player = gameState.players.find(p => p.id === playerId);
    return player?.roleState?.visibleAsTeam || player?.roleState?.realTeam;
}


