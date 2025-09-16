import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLES } from '../roles';
import { PlayerManager } from '../core/managers/PlayerManager';
import type { GameState, Player, RoleDef } from '../types';

/**
 * Game API Composable
 * Provides a clean, consistent API for role interactions and game state access
 * This eliminates props drilling and provides a standardized way to interact with the game
 */
export function useGameAPI() {
    const store = useGameStore();
    const state = store.state;

    // ===== PLAYER QUERIES =====

    /**
     * Get all alive players
     */
    const getAlivePlayers = computed(() => {
        return state.players.filter(p => p.alive);
    });

    /**
     * Get all dead players
     */
    const getDeadPlayers = computed(() => {
        return state.players.filter(p => !p.alive);
    });

    /**
     * Get players by role ID
     */
    const getPlayersByRole = (roleId: string) => {
        return state.players.filter(p => p.roleId === roleId);
    };

    /**
     * Get alive players by role ID
     */
    const getAlivePlayersByRole = (roleId: string) => {
        return state.players.filter(p => p.roleId === roleId && p.alive);
    };

    /**
     * Get dead players by role ID
     */
    const getDeadPlayersByRole = (roleId: string) => {
        return state.players.filter(p => p.roleId === roleId && !p.alive);
    };

    /**
     * Find player by ID
     */
    const getPlayer = (playerId: number) => {
        return state.players.find(p => p.id === playerId);
    };

    /**
     * Get players by team (considering visibleAsTeam)
     */
    const getPlayersByTeam = (team: string) => {
        return state.players.filter(p => {
            const visibleTeam = p.roleState?.visibleAsTeam || p.roleState?.realTeam;
            return visibleTeam === team;
        });
    };

    /**
     * Get alive players by team (considering visibleAsTeam)
     */
    const getAlivePlayersByTeam = (team: string) => {
        return state.players.filter(p => {
            if (!p.alive) return false;
            const visibleTeam = p.roleState?.visibleAsTeam || p.roleState?.realTeam;
            return visibleTeam === team;
        });
    };

    // ===== ROLE QUERIES =====

    /**
     * Get role definition by ID
     */
    const getRole = (roleId: string): RoleDef | undefined => {
        return ROLES[roleId];
    };

    /**
     * Check if a player has a specific role (considering groupings if enabled)
     */
    const hasRole = (playerId: number, roleId: string, considerGroupings: boolean = false): boolean => {
        const player = getPlayer(playerId);
        if (!player) return false;

        if (player.roleId === roleId) return true;

        if (considerGroupings && state.groupings) {
            return state.groupings.some(grouping => 
                grouping.fromRole === roleId && grouping.toRole === player.roleId
            );
        }

        return false;
    };

    /**
     * Check if a player has any of the specified roles (considering groupings if enabled)
     */
    const hasAnyRole = (playerId: number, roleIds: string[], considerGroupings: boolean = false): boolean => {
        return roleIds.some(roleId => hasRole(playerId, roleId, considerGroupings));
    };

    /**
     * Get all players with a specific role (considering groupings if enabled)
     */
    const getPlayersWithRole = (roleId: string, considerGroupings: boolean = false): Player[] => {
        if (!considerGroupings) {
            return getPlayersByRole(roleId);
        }

        const directPlayers = getPlayersByRole(roleId);
        const groupedPlayers: Player[] = [];

        if (state.groupings) {
            for (const grouping of state.groupings) {
                if (grouping.fromRole === roleId) {
                    groupedPlayers.push(...getPlayersByRole(grouping.toRole));
                }
            }
        }

        // Combine and deduplicate
        const allPlayers = [...directPlayers, ...groupedPlayers];
        return allPlayers.filter((player, index, self) => 
            self.findIndex(p => p.id === player.id) === index
        );
    };

    /**
     * Get alive players with a specific role (considering groupings if enabled)
     */
    const getAlivePlayersWithRole = (roleId: string, considerGroupings: boolean = false): Player[] => {
        return getPlayersWithRole(roleId, considerGroupings).filter(p => p.alive);
    };

    // ===== GAME STATE QUERIES =====

    /**
     * Get current night number
     */
    const getNightNumber = computed(() => state.nightNumber);

    /**
     * Get current day number
     */
    const getDayNumber = computed(() => state.dayNumber);

    /**
     * Get current phase
     */
    const getPhase = computed(() => state.phase);

    /**
     * Check if it's the first night
     */
    const isFirstNight = computed(() => state.nightNumber === 1);

    /**
     * Check if first night actions are skipped
     */
    const isFirstNightSkipped = computed(() => {
        return state.settings?.skipFirstNightActions && isFirstNight.value;
    });

    // ===== NIGHT CONTEXT QUERIES =====

    /**
     * Get pending kills for a player
     */
    const getPendingKills = (playerId: number) => {
        return state.night?.context?.pendingKills?.[playerId] || [];
    };

    /**
     * Check if a player has pending kills
     */
    const hasPendingKills = (playerId: number) => {
        return getPendingKills(playerId).length > 0;
    };

    /**
     * Get saves for a player
     */
    const getSaves = (playerId: number) => {
        return state.night?.context?.savesBy?.filter((save: any) => save.target === playerId) || [];
    };

    /**
     * Check if a player was saved
     */
    const wasSaved = (playerId: number) => {
        return getSaves(playerId).length > 0;
    };

    /**
     * Get investigation checks
     */
    const getChecks = () => {
        return state.night?.context?.checks || [];
    };

    // ===== ROLE ACTIONS =====

    /**
     * Add a kill to pending kills
     */
    const addKill = (targetId: number, killerRole: string, data?: any) => {
        if (!state.night?.context) return;
        if (!state.night.context.pendingKills) {
            state.night.context.pendingKills = {};
        }
        if (!state.night.context.pendingKills[targetId]) {
            state.night.context.pendingKills[targetId] = [];
        }
        state.night.context.pendingKills[targetId].push({ role: killerRole, ...data });
    };

    /**
     * Remove kills from pending kills
     */
    const removeKills = (targetId: number, killerRole: string) => {
        if (!state.night?.context?.pendingKills?.[targetId]) return;
        state.night.context.pendingKills[targetId] = state.night.context.pendingKills[targetId]
            .filter((kill: any) => kill.role !== killerRole);
        if (state.night.context.pendingKills[targetId].length === 0) {
            delete state.night.context.pendingKills[targetId];
        }
    };

    /**
     * Add a save
     */
    const addSave = (targetId: number, saverId: number, fromRoles: string[]) => {
        if (!state.night?.context) return;
        if (!state.night.context.savesBy) {
            state.night.context.savesBy = [];
        }
        state.night.context.savesBy.push({
            by: saverId,
            target: targetId,
            fromRoles
        });
    };

    /**
     * Add an investigation check
     */
    const addCheck = (investigatorId: number, targetId: number, discoveredTeam: string) => {
        if (!state.night?.context) return;
        if (!state.night.context.checks) {
            state.night.context.checks = [];
        }
        state.night.context.checks.push({
            by: investigatorId,
            target: targetId,
            team: discoveredTeam
        });
    };

    /**
     * Modify player's visible team
     */
    const setPlayerVisibleTeam = (playerId: number, team: string) => {
        const player = getPlayer(playerId);
        if (player) {
            player.roleState.visibleAsTeam = team;
        }
    };

    /**
     * Block a player's night actions
     */
    const blockPlayer = (playerId: number) => {
        const player = getPlayer(playerId);
        if (player) {
            player.roleState.actsAtNight = 'blocked';
        }
    };

    /**
     * Restore a player's night actions
     */
    const unblockPlayer = (playerId: number, originalActsAtNight: string) => {
        const player = getPlayer(playerId);
        if (player) {
            player.roleState.actsAtNight = originalActsAtNight as any;
        }
    };

    // ===== USAGE TRACKING =====

    /**
     * Record that a role power was used
     */
    const recordPowerUsage = (roleId: string, playerId: number) => {
        if (!state.usedPowers) {
            state.usedPowers = {};
        }
        if (!state.usedPowers[roleId]) {
            state.usedPowers[roleId] = [];
        }
        state.usedPowers[roleId].push(playerId);
    };

    /**
     * Get power usage count for a player
     */
    const getPowerUsageCount = (roleId: string, playerId: number) => {
        const usedPowers = state.usedPowers?.[roleId] || [];
        return usedPowers.filter((id: number) => id === playerId).length;
    };

    /**
     * Check if a player can use their power (considering usage limits)
     */
    const canUsePower = (playerId: number) => {
        const player = getPlayer(playerId);
        if (!player) return false;

        const roleDef = getRole(player.roleId);
        if (!roleDef) return false;

        // Check usage limits
        if (roleDef.numberOfUsage !== 'unlimited' && roleDef.numberOfUsage !== undefined) {
            const timesUsed = getPowerUsageCount(player.roleId, playerId);
            return timesUsed < roleDef.numberOfUsage;
        }

        return true;
    };

    // ===== WIN CONDITIONS =====

    /**
     * Check if a team has won
     */
    const checkTeamWin = (team: string) => {
        const roleDefs = Object.values(ROLES).filter(role => role.team === team);
        return roleDefs.some(role => role.checkWin?.(state));
    };

    /**
     * Get all winning teams
     */
    const getWinningTeams = () => {
        const teams = new Set<string>();
        const allTeams = new Set(Object.values(ROLES).map(role => role.team));
        
        for (const team of allTeams) {
            if (checkTeamWin(team)) {
                teams.add(team);
            }
        }
        
        return Array.from(teams);
    };

    // ===== CUSTOM DATA =====

    /**
     * Get custom data for a role
     */
    const getCustomData = (roleId: string) => {
        if (!state.custom) state.custom = {};
        if (!state.custom[roleId]) state.custom[roleId] = {};
        return state.custom[roleId];
    };

    /**
     * Set custom data for a role
     */
    const setCustomData = (roleId: string, data: any) => {
        if (!state.custom) state.custom = {};
        state.custom[roleId] = { ...state.custom[roleId], ...data };
    };

    /**
     * Clear custom data for a role
     */
    const clearCustomData = (roleId: string) => {
        if (state.custom) {
            delete state.custom[roleId];
        }
    };

    // ===== ROLE TRANSFORMATIONS =====

    /**
     * Apply passive effects for a specific role
     */
    const applyPassiveEffects = (roleId: string, gameState: any) => {
        const roleDef = getRole(roleId);
        if (!roleDef || typeof roleDef.passiveEffect !== 'function') {
            return;
        }

        const players = gameState.players.filter((p: any) => p.roleId === roleId && p.alive);
        
        for (const player of players) {
            try {
                console.log(`🔄 [DEBUG] Applying passive effect for ${roleId} player ${player.name}`);
                const result = roleDef.passiveEffect(gameState, player);
                if (result != null) {
                    if (!gameState.history[gameState.nightNumber]) {
                        gameState.history[gameState.nightNumber] = {};
                    }
                    gameState.history[gameState.nightNumber][roleId] = result;
                }
            } catch (error) {
                console.error(`Error applying passive effect for ${roleId}:`, error);
            }
        }
    };

    /**
     * Apply grouping functions for a specific role
     */
    const applyGroupingFunctions = (roleId: string, gameState: any) => {
        const roleDef = getRole(roleId);
        if (!roleDef || typeof roleDef.groups !== 'function') {
            return;
        }

        try {
            console.log(`🔄 [DEBUG] Applying grouping function for ${roleId}`);
            const groupings = roleDef.groups(gameState);
            if (Array.isArray(groupings)) {
                if (!gameState.groupings) {
                    gameState.groupings = [];
                }
                
                // Add new groupings (avoid duplicates)
                for (const grouping of groupings) {
                    const exists = gameState.groupings.some(g => 
                        g.fromRole === grouping.fromRole && g.toRole === grouping.toRole
                    );
                    if (!exists) {
                        gameState.groupings.push(grouping);
                        console.log(`🔄 [DEBUG] Added grouping: ${grouping.fromRole} -> ${grouping.toRole}`);
                    }
                }
            }
        } catch (error) {
            console.error(`Error applying grouping function for ${roleId}:`, error);
        }
    };

    /**
     * Change a single player's role
     */
    const changePlayerRole = (playerId: number, newRoleId: string, gameState: any) => {
        // Use the passed gameState instead of the store state
        const player = gameState.players.find((p: Player) => p.id === playerId);
        if (!player) {
            console.error(`Player with ID ${playerId} not found`);
            return null;
        }

        const newRoleDef = getRole(newRoleId);
        if (!newRoleDef) {
            console.error(`Role ${newRoleId} not found`);
            return null;
        }

        const oldRoleId = player.roleId;
        
        // Change the role
        player.roleId = newRoleId;
        PlayerManager.initializePlayerRoleState(player, newRoleDef);
        
        console.log(`🔄 [DEBUG] Transformed player ${player.name} (ID: ${player.id}) from ${oldRoleId} to ${newRoleId}`);

        // Apply passive effects immediately
        applyPassiveEffects(newRoleId, gameState);

        // Apply grouping functions immediately
        applyGroupingFunctions(newRoleId, gameState);

        // Handle role transformation during night phase
        if (gameState.phase === 'night' && gameState.night?.context) {
            // Remove the original role from calledRoles if it was added
            const calledRoles = gameState.night.context.calledRoles;
            const oldRoleIndex = calledRoles.indexOf(oldRoleId);
            if (oldRoleIndex !== -1) {
                calledRoles.splice(oldRoleIndex, 1);
                console.log(`🔄 [DEBUG] Removed '${oldRoleId}' from calledRoles to allow new role to act`);
            }
        }

        // Clean up usedPowers for the transformed player
        if (gameState.usedPowers && gameState.usedPowers[newRoleId]) {
            gameState.usedPowers[newRoleId] = gameState.usedPowers[newRoleId].filter(
                (id: number) => id !== playerId
            );
        }

        return {
            player,
            oldRoleId,
            newRoleId,
            newRoleDef
        };
    };

    /**
     * Change multiple players' roles to the same role
     */
    const changeMultiplePlayerRoles = (playerIds: number[], newRoleId: string, gameState: any) => {
        const results = [];
        const oldRoleIds = new Set<string>();

        for (const playerId of playerIds) {
            const result = changePlayerRole(playerId, newRoleId, gameState);
            if (result) {
                results.push(result);
                oldRoleIds.add(result.oldRoleId);
            }
        }

        // Handle night phase cleanup for all old roles
        if (gameState.phase === 'night' && gameState.night?.context) {
            const calledRoles = gameState.night.context.calledRoles;
            for (const oldRoleId of oldRoleIds) {
                const oldRoleIndex = calledRoles.indexOf(oldRoleId);
                if (oldRoleIndex !== -1) {
                    calledRoles.splice(oldRoleIndex, 1);
                    console.log(`🔄 [DEBUG] Removed '${oldRoleId}' from calledRoles to allow new role to act`);
                }
            }
        }

        console.log(`🔄 [DEBUG] Transformation complete. ${results.length} players transformed to ${newRoleId}`);
        return results;
    };

    return {
        // Player queries
        getAlivePlayers,
        getDeadPlayers,
        getPlayersByRole,
        getAlivePlayersByRole,
        getDeadPlayersByRole,
        getPlayer,
        getPlayersByTeam,
        getAlivePlayersByTeam,

        // Role queries
        getRole,
        hasRole,
        hasAnyRole,
        getPlayersWithRole,
        getAlivePlayersWithRole,

        // Game state queries
        getNightNumber,
        getDayNumber,
        getPhase,
        isFirstNight,
        isFirstNightSkipped,

        // Night context queries
        getPendingKills,
        hasPendingKills,
        getSaves,
        wasSaved,
        getChecks,

        // Role actions
        addKill,
        removeKills,
        addSave,
        addCheck,
        setPlayerVisibleTeam,
        blockPlayer,
        unblockPlayer,

        // Usage tracking
        recordPowerUsage,
        getPowerUsageCount,
        canUsePower,

        // Win conditions
        checkTeamWin,
        getWinningTeams,

        // Custom data
        getCustomData,
        setCustomData,
        clearCustomData,

        // Role transformations
        changePlayerRole,
        changeMultiplePlayerRoles,
        applyPassiveEffects,
        applyGroupingFunctions
    };
}
