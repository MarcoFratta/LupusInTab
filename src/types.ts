export type Team = string;

export interface RoleDef {
	id: string;
	name: string;
	team: Team;
    /**
     * How this role is seen by investigative roles (e.g., medium).
     * Defaults to `team` when not provided.
     */
    visibleAsTeam?: Team;
    /** If false, players of this role won't automatically see allies of the same team during reveal */
    revealAlliesWithinTeam?: boolean;
    /** Short description to show under the role name on reveal */
    description?: string;
    /** Hex color (e.g. #ef4444) used as role identifier color in UI */
    color?: string;
	phaseOrder: number;
	group?: boolean;
	actsAtNight?: boolean;
    /**
     * Usage policy for the role's power.
     * - 'unlimited': may act any night as allowed
     * - 'once': may act only once per match
     * - 'requiredEveryNight': must act every night (engine will still remain dumb; prompts can enforce)
     */
    usage?: 'unlimited' | 'once' | 'requiredEveryNight';
    /**
     * Whether this role is allowed to target dead players.
     */
    canTargetDead?: boolean;
    /**
     * For roles that interact with pending kills (e.g., Doctor), which killer roleIds their effect applies to.
     * Example: ['wolf'] means it can counter kills initiated by wolves.
     */
    affectsKillers?: string[];
    /** If present, killers in this list cannot kill this role (are ignored at resolve) */
    immuneToKillers?: string[];
    /**
     * Roles that should be known to players of specific teams during the reveal phase.
     * Example: an executioner might set knownToTeams: ['wolf'] so wolves see who the executioner is.
     */
    knownToTeams?: string[];
    /**
     * During reveal, show other players who have any of these roleIds as partners/allies to the current player.
     * Example: lovers could set revealPartnersRoleIds: ['lover'] so each lover sees the other lover.
     */
    revealPartnersRoleIds?: string[];
    /** How this role should be displayed to faction allies during reveal ('role' shows role name, 'team' shows only faction) */
    revealToAllies?: 'role' | 'team';
    /** How this role should be displayed to its partners during reveal ('role' shows role name, 'team' shows only faction) */
    revealToPartners?: 'role' | 'team';
    /** Whether this role should count as a wolf for win condition parity checks */
    countsAsWolfForWin?: boolean;
    /**
     * Setup constraints for how many copies of this role can be selected.
     * If not specified, role can be 0..N.
     */
    minCount?: number | ((numPlayers: number) => number);
    maxCount?: number | ((numPlayers: number) => number);
    /** If provided, the allowed counts must be one of these values (computed against player count). */
    allowedCounts?: number[] | ((numPlayers: number) => number[]);
    getPromptComponent?: (gameState: any, player: any) => () => Promise<any>;
    getGroupPromptComponent?: (gameState: any, entry: any) => () => Promise<any>;
    /** Optional component factory to render per-actor resolve details (single roles) */
    getResolveDetailsComponent?: (gameState: any, entry: any) => () => Promise<any>;
    /** Optional component factory to render grouped resolve details (group roles) */
    getGroupResolveDetailsComponent?: (gameState: any, entry: any) => () => Promise<any>;
    resolve: (gameState: any, entry: any) => void;
    /**
     * Optional per-role win check. It should return true when this role's faction has met its winning condition.
     * The engine will iterate alive players and, if any alive player's role checkWin returns true,
     * it declares that role's team as the winner.
     */
    checkWin?: (gameState: any) => boolean;
}


