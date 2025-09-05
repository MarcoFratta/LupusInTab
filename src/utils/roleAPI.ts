import { useGameAPI } from '../composables/useGameAPI';

/**
 * Role API Utility
 * Provides a way for roles to access the Game API without circular dependencies
 * This is a temporary solution until we can properly inject the API
 */
let gameAPIInstance: ReturnType<typeof useGameAPI> | null = null;

export function initializeRoleAPI() {
    if (!gameAPIInstance) {
        gameAPIInstance = useGameAPI();
    }
}

export function setGameAPI(api: ReturnType<typeof useGameAPI>) {
    gameAPIInstance = api;
}

export function getGameAPI(): ReturnType<typeof useGameAPI> {
    if (!gameAPIInstance) {
        // Fallback to creating a new instance if not set
        gameAPIInstance = useGameAPI();
    }
    return gameAPIInstance;
}

/**
 * Role API Helper Functions
 * These provide a clean interface for common role operations
 */
export const RoleAPI = {
    // Player queries
    getAlivePlayers: () => getGameAPI().getAlivePlayers.value,
    getDeadPlayers: () => getGameAPI().getDeadPlayers.value,
    getPlayer: (id: number) => getGameAPI().getPlayer(id),
    getPlayersByRole: (roleId: string) => getGameAPI().getPlayersByRole(roleId),
    getAlivePlayersByRole: (roleId: string) => getGameAPI().getAlivePlayersByRole(roleId),
    getPlayersByTeam: (team: string) => getGameAPI().getPlayersByTeam(team),
    getAlivePlayersByTeam: (team: string) => getGameAPI().getAlivePlayersByTeam(team),

    // Role queries
    hasRole: (playerId: number, roleId: string, considerGroupings: boolean = false) => 
        getGameAPI().hasRole(playerId, roleId, considerGroupings),
    hasAnyRole: (playerId: number, roleIds: string[], considerGroupings: boolean = false) => 
        getGameAPI().hasAnyRole(playerId, roleIds, considerGroupings),
    getPlayersWithRole: (roleId: string, considerGroupings: boolean = false) => 
        getGameAPI().getPlayersWithRole(roleId, considerGroupings),
    getAlivePlayersWithRole: (roleId: string, considerGroupings: boolean = false) => 
        getGameAPI().getAlivePlayersWithRole(roleId, considerGroupings),

    // Game state
    getNightNumber: () => getGameAPI().getNightNumber.value,
    getDayNumber: () => getGameAPI().getDayNumber.value,
    getPhase: () => getGameAPI().getPhase.value,
    isFirstNight: () => getGameAPI().isFirstNight.value,
    isFirstNightSkipped: () => getGameAPI().isFirstNightSkipped.value,

    // Night context
    getPendingKills: (playerId: number) => getGameAPI().getPendingKills(playerId),
    hasPendingKills: (playerId: number) => getGameAPI().hasPendingKills(playerId),
    getSaves: (playerId: number) => getGameAPI().getSaves(playerId),
    wasSaved: (playerId: number) => getGameAPI().wasSaved(playerId),
    getChecks: () => getGameAPI().getChecks(),

    // Role actions
    addKill: (targetId: number, killerRole: string, data?: any) => 
        getGameAPI().addKill(targetId, killerRole, data),
    removeKills: (targetId: number, killerRole: string) => 
        getGameAPI().removeKills(targetId, killerRole),
    addSave: (targetId: number, saverId: number, fromRoles: string[]) => 
        getGameAPI().addSave(targetId, saverId, fromRoles),
    addCheck: (investigatorId: number, targetId: number, discoveredTeam: string) => 
        getGameAPI().addCheck(investigatorId, targetId, discoveredTeam),
    setPlayerVisibleTeam: (playerId: number, team: string) => 
        getGameAPI().setPlayerVisibleTeam(playerId, team),
    blockPlayer: (playerId: number) => getGameAPI().blockPlayer(playerId),
    unblockPlayer: (playerId: number, originalActsAtNight: string) => 
        getGameAPI().unblockPlayer(playerId, originalActsAtNight),

    // Usage tracking
    recordPowerUsage: (roleId: string, playerId: number) => 
        getGameAPI().recordPowerUsage(roleId, playerId),
    getPowerUsageCount: (roleId: string, playerId: number) => 
        getGameAPI().getPowerUsageCount(roleId, playerId),
    canUsePower: (playerId: number) => getGameAPI().canUsePower(playerId),

    // Win conditions
    checkTeamWin: (team: string) => getGameAPI().checkTeamWin(team),
    getWinningTeams: () => getGameAPI().getWinningTeams(),

    // Custom data
    getCustomData: (roleId: string) => getGameAPI().getCustomData(roleId),
    setCustomData: (roleId: string, data: any) => getGameAPI().setCustomData(roleId, data),
    clearCustomData: (roleId: string) => getGameAPI().clearCustomData(roleId)
};
