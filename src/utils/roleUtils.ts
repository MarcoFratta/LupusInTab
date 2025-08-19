/**
 * Utility functions for roles to interact with the game state
 */

/**
 * Determines if a player can act at night based on their runtime state
 * @param player The player to check
 * @returns true if the player can act at night, false otherwise
 */
export function canPlayerActAtNight(player: any): boolean {
    const actsAtNight = player.roleState?.actsAtNight;
    
    // Check all conditions that prevent acting at night
    if (actsAtNight === "never") return false;
    if (actsAtNight === "blocked") return false;
    if (actsAtNight === "alive" && !player.alive) return false;
    if (actsAtNight === "dead" && player.alive) return false;
    
    // If actsAtNight is "always", player can always act
    if (actsAtNight === "always") return true;
    
    // If actsAtNight is "alive" and player is alive, they can act
    if (actsAtNight === "alive" && player.alive) return true;
    
    // If actsAtNight is "dead" and player is dead, they can act
    if (actsAtNight === "dead" && !player.alive) return true;
    
    // For any other value or undefined, default to false
    return false;
}

/**
 * Get the visible team of a player, considering any temporary overrides
 */
export function getPlayerVisibleTeam(gameState: any, playerId: number): string | undefined {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (player && player.roleState) {
        return player.roleState.visibleAsTeam || player.roleState.realTeam;
    }
    return undefined;
}

/**
 * Get the real-time visible team of a player, considering pending Insinuo effects
 * This is used during the night phase to show what a player will appear as
 */
export function getPlayerRealTimeVisibleTeam(gameState: any, playerId: number): string | undefined {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (!player || !player.roleState) return undefined;
    
    // Since roles are now resolved immediately, just return the current visible team
    // The Insinuo effect is already applied to the player's roleState
    return player.roleState.visibleAsTeam || player.roleState.realTeam;
}

/**
 * Get or create a player's custom data space
 */
export function getPlayerCustomData(gameState: any, playerId: number, roleId: string): any {
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[playerId]) gameState.custom[playerId] = {};
    if (!gameState.custom[playerId][roleId]) gameState.custom[playerId][roleId] = {};
    return gameState.custom[playerId][roleId];
}

/**
 * Get or create a player's custom data space only if the player is alive
 */
export function getPlayerCustomDataIfAlive(gameState: any, playerId: number, roleId: string): any | null {
    const player = gameState.players.find((p: any) => p.id === playerId);
    if (!player || !player.alive) return null;
    
    if (!gameState.custom) gameState.custom = {};
    if (!gameState.custom[playerId]) gameState.custom[playerId] = {};
    if (!gameState.custom[playerId][roleId]) gameState.custom[playerId][roleId] = {};
    return gameState.custom[playerId][roleId];
}

/**
 * Clean up a player's custom data for a specific role
 */
export function cleanupPlayerCustomData(gameState: any, playerId: number, roleId: string): void {
    if (gameState.custom?.[playerId]?.[roleId]) {
        delete gameState.custom[playerId][roleId];
        if (Object.keys(gameState.custom[playerId]).length === 0) {
            delete gameState.custom[playerId];
        }
        // Don't delete the entire custom property, just keep it as an empty object
        if (Object.keys(gameState.custom).length === 0) {
            gameState.custom = {};
        }
    }
}

/**
 * Add an event to the game history for a specific night
 */
export function addToHistory(gameState: any, playerId: number, nightNumber: number, eventType: string, eventData: any): void {
    if (!gameState.history) gameState.history = {};
    if (!gameState.history[nightNumber]) gameState.history[nightNumber] = {};
    
    gameState.history[nightNumber][playerId] = {
        type: eventType,
        nightNumber,
        playerId,
        data: eventData
    };
}

/**
 * Get all events for a specific player and night
 */
export function getPlayerNightEvents(gameState: any, playerId: number, nightNumber: number): any[] {
    if (!gameState.history || !gameState.history[nightNumber]) return [];
    const playerAction = gameState.history[nightNumber][playerId];
    return playerAction ? [playerAction] : [];
}

/**
 * Get all events for a specific night across all players
 */
export function getNightEvents(gameState: any, nightNumber: number): any[] {
    if (!gameState.history || !gameState.history[nightNumber]) return [];
    return Object.values(gameState.history[nightNumber]);
}

/**
 * Get a map of player actions for a specific night
 */
export function getNightPlayerActions(gameState: any, nightNumber: number): Record<number, any> {
    return gameState.history?.[nightNumber] || {};
}
